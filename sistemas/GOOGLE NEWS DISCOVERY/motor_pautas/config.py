"""Configuração do motor.

Dois arquivos, ambos recarregados a quente por mtime (mesmo idioma do
portal-engine: editar o arquivo recarrega, sem reiniciar o serviço):

  config/sites.json        — um objeto por portal: queries, filtros, perfil de
                             redação, categorias válidas, instância do receptor
  config/credenciais.json  — endpoint + X-API-KEY por portal (modo 600)

Segredos de provedor vêm do ambiente (config/motor-pautas.env), nunca do JSON.
"""
from __future__ import annotations
import json, os, threading, time
from pathlib import Path

RAIZ = Path(os.environ.get("MP_RAIZ", "/opt/motor-pautas"))
ESTADO = Path(os.environ.get("MP_ESTADO", "/srv/motor-pautas"))
DIR_CFG = RAIZ / "config"
CAM_SITES = DIR_CFG / "sites.json"
CAM_CRED = DIR_CFG / "credenciais.json"

_trava = threading.Lock()
_cache = {"sites": None, "sites_mtime": 0.0, "cred": None, "cred_mtime": 0.0}


def _carregar(caminho, chave):
    try:
        mt = caminho.stat().st_mtime
    except FileNotFoundError:
        return {} if chave == "cred" else []
    with _trava:
        if _cache[f"{chave}_mtime"] == mt and _cache[chave] is not None:
            return _cache[chave]
        with open(caminho, "r", encoding="utf-8") as fh:
            dados = json.load(fh)
        _cache[chave] = dados
        _cache[f"{chave}_mtime"] = mt
        return dados


def sites():
    """Portais ativos, sem os pausados pela conferencia.

    A pausa por portal vive em `motor_estado`, nao neste arquivo: assim a
    conferencia automatica pode tirar um portal do ar sem reescrever o JSON
    que o operador edita a mao, e retomar e um comando.
    """
    d = _carregar(CAM_SITES, "sites")
    lista = d.get("sites", d) if isinstance(d, dict) else d
    ativos = [s for s in lista if s.get("ativo", True)]
    try:
        from . import verificacao
        pausados = verificacao.pausados()
    except Exception:
        pausados = {}
    return [s for s in ativos if s["slug"] not in pausados]


def site(slug):
    for s in sites():
        if s["slug"] == slug:
            return s
    return None


def credenciais():
    d = _carregar(CAM_CRED, "cred")
    return d.get("portais", d) if isinstance(d, dict) else d


def credencial(slug):
    return credenciais().get(slug)


def geral():
    d = _carregar(CAM_SITES, "sites")
    return d.get("geral", {}) if isinstance(d, dict) else {}


def env(nome, padrao=None, obrigatorio=False):
    v = os.environ.get(nome, padrao)
    if obrigatorio and not v:
        raise RuntimeError(f"variável de ambiente {nome} não definida")
    return v


# ---- parâmetros operacionais, com padrão e sobreposição por sites.json:geral
def _g(chave, padrao):
    return geral().get(chave, padrao)


def dsn():
    return env("MP_DSN", "<<REMOVIDO>>")


def teto_mensal_brl():   return float(_g("teto_mensal_brl", 500.0))
def cambio_usd_brl():    return float(_g("cambio_usd_brl", 0) or 0)
def modelo_geracao():    return _g("modelo_geracao", "claude-sonnet-5")
def modelo_mecanico():   return _g("modelo_mecanico", "claude-haiku-4-5")
def modelo_embedding():  return _g("modelo_embedding", "text-embedding-3-small")
def modelo_imagem():     return _g("modelo_imagem", "runware:100@1")
def thinking_geracao():  return _g("thinking_geracao", "disabled")
def intervalo_coleta():  return int(_g("intervalo_coleta_min", 20))
def min_dominios():      return int(_g("min_dominios_por_fato", 2))
def limiar_cosseno():    return float(_g("limiar_cosseno", 0.82))
def janela_fato_h():     return int(_g("janela_fato_horas", 48))
def throttle_seg():      return int(_g("throttle_publicacao_seg", 45))
def porta_painel():      return int(_g("porta_painel", 3400))


def url_painel():
    """URL do painel para os e-mails de alerta.

    O painel escuta so em 127.0.0.1, entao o link util e o do tunel SSH.
    MP_URL_PAINEL permite trocar se um dia houver acesso por dominio.
    """
    # env() devolve string VAZIA quando a variavel existe sem valor, que e o
    # caso do .env de exemplo. Vazio tem que cair no padrao, senao o link some
    # de todo alerta sem ninguem perceber.
    v = (env("MP_URL_PAINEL") or "").strip()
    if v:
        return v
    return ("http://127.0.0.1:{p} (via: ssh -L {p}:127.0.0.1:{p} gnd-motor)"
            .format(p=porta_painel()))
def teste_cego_ativo():  return bool(_g("teste_cego_ativo", False))
def teste_cego_alvo():   return int(_g("teste_cego_alvo", 10))
def artigos_por_semana(): return int(_g("artigos_por_semana_por_portal", 3))
