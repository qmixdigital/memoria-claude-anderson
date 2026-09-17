# 1_download.py
# Mirror: Casa dos Dados (dados oficiais da Receita Federal espelhados via CDN)
import os, time, requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from tqdm import tqdm

BASE = "https://dados-abertos-rf-cnpj.casadosdados.com.br/arquivos/2026-03-16/"
PASTA = "dados_raw"
os.makedirs(PASTA, exist_ok=True)

# Sessão com retry automático
session = requests.Session()
retries = Retry(total=5, backoff_factor=10, status_forcelist=[429, 500, 502, 503, 504])
session.mount("https://", HTTPAdapter(max_retries=retries))

arquivos = (
    [f"Estabelecimentos{i}.zip" for i in range(10)] +
    [f"Empresas{i}.zip" for i in range(10)]
)

for nome in arquivos:
    destino = os.path.join(PASTA, nome)
    if os.path.exists(destino):
        print(f"[JÁ EXISTE] {nome}")
        continue

    for tentativa in range(5):
        try:
            print(f"[BAIXANDO] {nome} (tentativa {tentativa + 1})")
            r = session.get(BASE + nome, stream=True, timeout=(60, 300))
            r.raise_for_status()
            total = int(r.headers.get("content-length", 0))
            with open(destino + ".tmp", "wb") as f, tqdm(total=total, unit="B", unit_scale=True) as barra:
                for chunk in r.iter_content(65536):
                    f.write(chunk)
                    barra.update(len(chunk))
            os.rename(destino + ".tmp", destino)
            print(f"[OK] {nome}")
            break
        except Exception as e:
            print(f"[ERRO] {nome}: {e}")
            if os.path.exists(destino + ".tmp"):
                os.remove(destino + ".tmp")
            if tentativa < 4:
                espera = 30 * (tentativa + 1)
                print(f"[AGUARDANDO] {espera}s antes de tentar novamente...")
                time.sleep(espera)
            else:
                print(f"[FALHOU] {nome} após 5 tentativas. Pulando.")
