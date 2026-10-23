"""Cliente DataForSEO: Basic Auth, cache em disco, contagem de custo e teto de gasto."""
from __future__ import annotations

import base64
import hashlib
import json
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

from .config import BASE_URL


class TetoExcedido(Exception):
    pass


class ErroApi(Exception):
    pass


class Cliente:
    def __init__(self, login: str, senha: str, cache_dir: Path, teto_usd: float, dry_run: bool = False, log=print):
        if not login or not senha:
            raise ErroApi("Credenciais ausentes: defina DATAFORSEO_LOGIN e DATAFORSEO_PASSWORD no .env")
        self._auth = "Basic " + base64.b64encode(f"{login}:{senha}".encode()).decode()
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.teto = teto_usd
        self.dry_run = dry_run
        self.gasto = 0.0          # pago nesta rodada
        self.gasto_cache = 0.0    # o que as respostas reaproveitadas do cache custaram quando foram feitas
        self.pedidos = 0
        self.pedidos_cache = 0
        self.log = log
        self._lock = threading.Lock()

    # ---------- HTTP ----------
    def _req(self, metodo: str, path: str, corpo=None, tentativas: int = 3) -> dict:
        dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8") if corpo is not None else None
        req = urllib.request.Request(
            BASE_URL + path,
            data=dados,
            method=metodo,
            headers={"Authorization": self._auth, "Content-Type": "application/json", "User-Agent": "raiox/1.0"},
        )
        erro = None
        for i in range(tentativas):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    return json.loads(r.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                texto = e.read().decode("utf-8", "replace")[:300]
                if e.code in (401, 402, 403, 404):
                    raise ErroApi(f"HTTP {e.code} em {path}: {texto}")
                erro = ErroApi(f"HTTP {e.code} em {path}: {texto}")
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                erro = ErroApi(f"Falha de rede em {path}: {e}")
            time.sleep(2 * (i + 1))
        raise erro  # type: ignore[misc]

    def get(self, path: str) -> dict:
        """GET gratuito (user_data, models, locations)."""
        return self._req("GET", path)

    # ---------- POST com cache e teto ----------
    def post(self, path: str, tarefa: dict, custo_estimado: float = 0.0, etiqueta: str = "") -> dict | None:
        """Envia uma tarefa (as APIs live aceitam uma por chamada). Devolve tasks[0].

        - Usa cache em disco: a mesma tarefa nunca é paga duas vezes.
        - Em dry_run, só soma a estimativa e devolve None.
        - Antes de gastar, confere o teto com a estimativa.
        """
        chave = hashlib.sha256((path + json.dumps(tarefa, sort_keys=True, ensure_ascii=False)).encode()).hexdigest()[:24]
        arq = self.cache_dir / f"{chave}.json"
        if arq.exists():
            guardado = json.loads(arq.read_text(encoding="utf-8"))
            with self._lock:
                self.pedidos_cache += 1
                self.gasto_cache += float(guardado.get("cost") or 0)
            return guardado

        with self._lock:
            if self.dry_run:
                self.gasto += custo_estimado
                self.pedidos += 1
                return None
            if self.gasto + custo_estimado > self.teto:
                raise TetoExcedido(
                    f"Teto de US$ {self.teto:.2f} seria ultrapassado: gasto US$ {self.gasto:.4f} + estimado US$ {custo_estimado:.4f} ({etiqueta or path})"
                )
            # reserva a estimativa enquanto a chamada roda, para threads paralelas não furarem o teto
            self.gasto += custo_estimado
            self.pedidos += 1

        try:
            resp = self._req("POST", path, [tarefa])
        except ErroApi:
            with self._lock:
                self.gasto -= custo_estimado
            raise
        if resp.get("status_code") != 20000:
            with self._lock:
                self.gasto -= custo_estimado
            raise ErroApi(f"{path}: {resp.get('status_code')} {resp.get('status_message')}")
        tarefa_resp = (resp.get("tasks") or [{}])[0]
        custo = float(tarefa_resp.get("cost") or 0)
        with self._lock:
            self.gasto += custo - custo_estimado
        if tarefa_resp.get("status_code") != 20000:
            # erro da tarefa (parâmetro inválido, sem dados...). Não guarda em cache.
            raise ErroApi(f"{path}: tarefa {tarefa_resp.get('status_code')} {tarefa_resp.get('status_message')}")
        arq.write_text(json.dumps(tarefa_resp, ensure_ascii=False), encoding="utf-8")
        self.log(f"   · {etiqueta or path}: US$ {custo:.4f} (acumulado US$ {self.gasto:.4f})")
        return tarefa_resp

    @property
    def gasto_total(self) -> float:
        """Custo de todos os dados usados: o pago agora mais o que o cache custou quando foi feito."""
        return self.gasto + self.gasto_cache

    # ---------- auxiliares ----------
    def saldo(self) -> dict:
        r = self.get("/v3/appendix/user_data")
        t = (r.get("tasks") or [{}])[0]
        res = (t.get("result") or [{}])[0]
        return {
            "saldo": (res.get("money") or {}).get("balance"),
            "limites": (res.get("rates") or {}).get("limits"),
            "status": t.get("status_message"),
        }

    def modelos(self, plataforma: str) -> list[dict]:
        r = self.get(f"/v3/ai_optimization/{plataforma}/llm_responses/models")
        t = (r.get("tasks") or [{}])[0]
        return t.get("result") or []


def resultado(tarefa: dict | None) -> dict:
    """Primeiro objeto de result[] de uma task, ou {} se vazio."""
    if not tarefa:
        return {}
    res = tarefa.get("result") or []
    return res[0] if res else {}
