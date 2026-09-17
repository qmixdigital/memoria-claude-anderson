# -*- coding: utf-8 -*-
"""
Editor Rápido de Vídeos
=======================
Ferramenta em Tkinter para tratar vídeos em lote:

  * Dividir um vídeo longo em vários vídeos menores, cortando nas pausas de fala
  * Espelhar na horizontal ou na vertical e girar 90/180 graus
  * Encurtar os trechos sem fala dentro do vídeo
  * Recortar para vertical 9:16, quadrado 1:1 ou horizontal 16:9
  * Normalizar o volume
  * Remover o áudio
  * Limpar o arquivo (apaga metadados e capítulos)

Regras de qualidade adotadas:

  * "Limpar" sozinho NÃO recomprime nada, o arquivo é copiado bit a bit.
  * O áudio só é recomprimido quando existe corte, divisão ou normalização.
  * O vídeo só é recomprimido quando alguma transformação muda a imagem ou quando
    o vídeo é dividido, e o padrão é CRF 17, indistinguível do original a olho.
  * Nada é ampliado: o recorte de formato só corta, nunca faz upscale.

Requisitos: ffmpeg e ffprobe. O script procura no PATH e nas pastas do WinGet.
"""

import glob
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import tkinter as tk
from collections import deque
from tkinter import filedialog, messagebox, ttk

SEM_JANELA = 0x08000000 if os.name == "nt" else 0

PASTA_SCRIPT = os.path.dirname(os.path.abspath(__file__))
CAMINHO_CONFIG = os.path.join(PASTA_SCRIPT, "config.json")

EXTENSOES = [
    ("Vídeos", "*.mp4 *.mov *.mkv *.avi *.webm *.m4v *.mpg *.mpeg *.wmv *.flv *.ts"),
    ("Todos os arquivos", "*.*"),
]

# CRF menor = mais qualidade e arquivo maior. 17 é o ponto em que o olho não
# distingue do original, mesmo em fonte já comprimida.
PERFIS_QUALIDADE = {
    "Máxima, sem perda visível (padrão)": {"crf": 17, "preset": "medium"},
    "Alta": {"crf": 20, "preset": "medium"},
    "Equilibrada": {"crf": 23, "preset": "medium"},
    "Arquivo bem menor": {"crf": 28, "preset": "slow"},
}
PERFIL_PADRAO = "Máxima, sem perda visível (padrão)"

GIROS = {
    "Não girar": [],
    "90 graus horário": ["transpose=1"],
    "90 graus anti-horário": ["transpose=2"],
    "180 graus": ["transpose=1", "transpose=1"],
}

# proporção largura/altura de cada formato de recorte
FORMATOS = {
    "Manter o original": None,
    "Vertical 9:16 (Reels, Shorts, TikTok)": (9, 16),
    "Quadrado 1:1 (feed)": (1, 1),
    "Horizontal 16:9 (YouTube)": (16, 9),
}

LIMIAR_MINIMO = -50.0   # piso da detecção automática
LIMIAR_MAXIMO = -18.0   # teto da detecção automática

TAMANHO_GRUPO = 50      # abaixo do limite de 100 somas seguidas do parser do ffmpeg
MAX_TRECHOS = 4000      # margem folgada: a expressão só quebra de verdade acima de 5000

# Preferimos H.264 (avc1) porque é o que o resto da ferramenta trata sem conversão.
QUALIDADES_DOWNLOAD = {
    "Melhor disponível": (
        "bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio/best[ext=mp4]/best"
    ),
    "Até 1080p": (
        "bestvideo[vcodec^=avc1][height<=1080]+bestaudio[ext=m4a]/"
        "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"
    ),
    "Até 720p": (
        "bestvideo[vcodec^=avc1][height<=720]+bestaudio[ext=m4a]/"
        "bestvideo[height<=720]+bestaudio/best[height<=720]/best"
    ),
}
QUALIDADE_DOWNLOAD_PADRAO = "Melhor disponível"

# O cliente padrão do yt-dlp às vezes devolve "This video is not available" para
# vídeo que existe e baixa sem problema por outro cliente. Passando a lista, ele
# tenta todos e junta os formatos que cada um enxerga.
CLIENTES_YOUTUBE = "default,android,tv,web"

NAVEGADORES = {
    "Sem cookies": None,
    "Chrome": "chrome",
    "Edge": "edge",
    "Firefox": "firefox",
    "Brave": "brave",
    "Opera": "opera",
}


def ytdlp_disponivel():
    try:
        import yt_dlp  # noqa: F401
    except ImportError:
        return False
    return True


def instalar_ytdlp():
    """Instala o yt-dlp no mesmo Python que está rodando esta janela."""
    resultado = rodar([sys.executable, "-m", "pip", "install", "--upgrade", "yt-dlp"])
    if resultado.returncode == 0:
        return True, ""
    return False, (resultado.stderr or resultado.stdout or "").strip()[-400:]


class DownloadCancelado(Exception):
    """Levantada de dentro do gancho de progresso para abortar o yt-dlp."""


class _LogMudo:
    """O yt-dlp escreve em stderr por padrão, e com pythonw não existe console."""

    def debug(self, _msg):
        pass

    def info(self, _msg):
        pass

    def warning(self, _msg):
        pass

    def error(self, _msg):
        pass


def baixar_videos(urls, pasta, formato, playlist, navegador, ffmpeg,
                  ao_progresso=None, ao_log=None, cancelado=None):
    """
    Baixa cada URL com o yt-dlp e devolve a lista de arquivos gravados.

    O yt-dlp é importado aqui dentro para a ferramenta continuar abrindo mesmo sem
    ele instalado: quem não usa download não precisa da dependência.
    """
    try:
        import yt_dlp
    except ImportError:
        raise RuntimeError(
            "yt-dlp não está instalado neste Python ({}). "
            "Instale com: \"{}\" -m pip install yt-dlp".format(sys.executable, sys.executable)
        )

    os.makedirs(pasta, exist_ok=True)

    def gancho(dados):
        if cancelado and cancelado():
            raise DownloadCancelado()
        if not ao_progresso:
            return
        if dados.get("status") == "downloading":
            total = dados.get("total_bytes") or dados.get("total_bytes_estimate") or 0
            if total:
                ao_progresso(100.0 * (dados.get("downloaded_bytes") or 0) / total)
        elif dados.get("status") == "finished":
            ao_progresso(100.0)

    opcoes = {
        "format": formato,
        "merge_output_format": "mp4",
        "outtmpl": os.path.join(pasta, "%(title).100s [%(id)s].%(ext)s"),
        "ffmpeg_location": os.path.dirname(ffmpeg) if ffmpeg else None,
        "noplaylist": not playlist,
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "logger": _LogMudo(),
        "progress_hooks": [gancho],
        "retries": 5,
        "fragment_retries": 5,
        "concurrent_fragment_downloads": 4,
        "extractor_args": {"youtube": {"player_client": CLIENTES_YOUTUBE.split(",")}},
    }
    if navegador:
        opcoes["cookiesfrombrowser"] = (navegador,)

    baixados = []
    falhas = []
    with yt_dlp.YoutubeDL(opcoes) as ydl:
        for url in urls:
            if cancelado and cancelado():
                falhas.append(url)
                continue
            if ao_log:
                ao_log("     baixando {}".format(url))
            try:
                info = ydl.extract_info(url, download=True)
            except DownloadCancelado:
                falhas.append(url)
                break
            except Exception as erro:  # noqa: BLE001
                falhas.append(url)
                if ao_log:
                    ao_log("     ERRO em {}: {}".format(url, _explicar_erro_download(erro)))
                continue

            for item in (info.get("entries") or [info]):
                if not item:
                    continue
                caminho = None
                for pedido in (item.get("requested_downloads") or []):
                    caminho = pedido.get("filepath") or caminho
                if not caminho:
                    caminho = ydl.prepare_filename(item)
                if caminho and os.path.exists(caminho):
                    baixados.append(caminho)
                    if ao_log:
                        ao_log("     OK {} ({})".format(
                            os.path.basename(caminho), formatar_duracao(item.get("duration") or 0)))
                elif ao_log:
                    ao_log("     aviso: não achei o arquivo de {}".format(item.get("title") or url))
    return baixados, falhas


def limpar_restos_download(pasta):
    """
    Remove o entulho transitório do yt-dlp e devolve (removidos, megabytes, orfaos).

    `.part` e `.ytdl` são sempre lixo: o primeiro é download pela metade, o segundo é
    o índice de retomada. Já os pedaços de faixa (`.f399.mp4`, `.f251.m4a`) só ficam
    para trás quando a junção falha, então são reportados em vez de apagados.
    """
    removidos, megabytes, orfaos = 0, 0.0, []
    if not os.path.isdir(pasta):
        return removidos, megabytes, orfaos

    for nome in os.listdir(pasta):
        caminho = os.path.join(pasta, nome)
        if not os.path.isfile(caminho):
            continue
        if nome.endswith((".part", ".ytdl")) or ".part-Frag" in nome:
            try:
                tamanho = os.path.getsize(caminho) / 1048576
                os.unlink(caminho)
                removidos += 1
                megabytes += tamanho
            except OSError:
                pass
        elif re.search(r"\.f\d+\.(mp4|m4a|webm|opus)$", nome):
            orfaos.append(nome)

    return removidos, megabytes, orfaos


def _explicar_erro_download(erro):
    """Traduz as falhas mais comuns do yt-dlp para algo acionável."""
    # o yt-dlp colore a saída, e o código ANSI sujava a mensagem no log
    texto = re.sub(r"\x1b\[[0-9;]*m", "", str(erro)).strip()
    baixo = texto.lower()
    if "confirm you" in baixo or "not a bot" in baixo or "sign in" in baixo:
        return ("o site pediu confirmação de que você não é robô. Escolha o seu navegador "
                "no campo Cookies e tente de novo")
    if "private video" in baixo or "members-only" in baixo or "members only" in baixo:
        return "vídeo privado ou restrito a membros"
    if ("unavailable" in baixo or "not available" in baixo
            or "removed" in baixo or "does not exist" in baixo):
        return ("o YouTube recusou este vídeo. Se ele abre no navegador, escolha o seu "
                "navegador no campo Cookies e tente de novo")
    if "age" in baixo and "restrict" in baixo:
        return "vídeo com restrição de idade, use a opção de cookies do navegador"
    if "unsupported url" in baixo or "is not a valid url" in baixo:
        return "link não reconhecido"
    if "copyright" in baixo or "blocked" in baixo:
        return "vídeo bloqueado no seu país ou por direitos autorais"
    return texto.replace("ERROR: ", "").strip()[:200]



# ---------------------------------------------------------------- utilitários


def encontrar_binario(nome):
    """Localiza ffmpeg/ffprobe no PATH ou nas instalações comuns do Windows."""
    executavel = nome + (".exe" if os.name == "nt" else "")
    achado = shutil.which(nome)
    if achado:
        return achado

    bases = [
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages"),
        os.path.join(os.environ.get("PROGRAMFILES", ""), "ffmpeg", "bin"),
        r"C:\ffmpeg\bin",
    ]
    for base in bases:
        if not base or not os.path.isdir(base):
            continue
        for hit in glob.glob(os.path.join(base, "**", executavel), recursive=True):
            return hit
    return None


def rodar(cmd):
    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=SEM_JANELA,
    )


def _numero(valor):
    try:
        return float(valor)
    except (TypeError, ValueError):
        return 0.0


def formatar_tamanho(megabytes):
    if megabytes >= 1024:
        return "{:.1f} GB".format(megabytes / 1024)
    if megabytes >= 1:
        return "{:.0f} MB".format(megabytes)
    return "{:.0f} KB".format(megabytes * 1024)


def formatar_duracao(segundos):
    segundos = max(0, int(round(segundos)))
    if segundos >= 3600:
        return "{}h{:02d}m{:02d}s".format(segundos // 3600, (segundos % 3600) // 60, segundos % 60)
    if segundos >= 60:
        return "{}m{:02d}s".format(segundos // 60, segundos % 60)
    return "{}s".format(segundos)


def inspecionar(ffprobe, caminho):
    """Lê duração, resolução e bitrates do arquivo."""
    cmd = [ffprobe, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", caminho]
    dados = {}
    try:
        dados = json.loads(rodar(cmd).stdout or "{}")
    except json.JSONDecodeError:
        pass

    streams = dados.get("streams", [])
    formato = dados.get("format", {})

    info = {
        "duracao": _numero(formato.get("duration")),
        "tem_audio": False,
        "tem_video": False,
        "bitrate_video": 0.0,
        "bitrate_audio": 0.0,
        "largura": 0,
        "altura": 0,
        "fps": 0.0,
    }

    for s in streams:
        if not info["duracao"]:
            info["duracao"] = max(info["duracao"], _numero(s.get("duration")))
        if s.get("codec_type") == "video" and not info["tem_video"]:
            info["tem_video"] = True
            info["largura"] = int(s.get("width") or 0)
            info["altura"] = int(s.get("height") or 0)
            info["bitrate_video"] = _numero(s.get("bit_rate"))
            taxa = s.get("r_frame_rate") or "0/1"
            try:
                num, den = taxa.split("/")
                info["fps"] = float(num) / float(den) if float(den) else 0.0
            except (ValueError, ZeroDivisionError):
                info["fps"] = 0.0
        elif s.get("codec_type") == "audio":
            info["tem_audio"] = True
            if not info["bitrate_audio"]:
                info["bitrate_audio"] = _numero(s.get("bit_rate"))

    return info


def limiar_automatico(ffmpeg, caminho):
    """
    Mede o volume do próprio vídeo e devolve o limiar de silêncio em dB.

    Vídeo com música ou ruído de fundo tem o piso de silêncio bem mais alto que os
    -30 dB de praxe. Usar um valor fixo faz a detecção não achar pausa nenhuma, por
    isso o limiar sai da distribuição real de volume do arquivo.
    """
    cmd = [
        ffmpeg, "-v", "error", "-nostdin", "-i", caminho,
        "-af", "aresample=8000,astats=metadata=1:reset=4,"
               "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
        "-f", "null", "-",
    ]
    saida = rodar(cmd).stdout or ""

    valores = []
    for bruto in re.findall(r"RMS_level=(-?[\w.]+)", saida):
        if bruto in ("-inf", "inf", "nan", "-nan"):
            valores.append(-100.0)  # silêncio digital
            continue
        try:
            valores.append(float(bruto))
        except ValueError:
            pass

    if len(valores) < 20:
        return None

    valores.sort()
    percentil_25 = valores[int(len(valores) * 0.25)]
    return max(LIMIAR_MINIMO, min(LIMIAR_MAXIMO, percentil_25 + 1.0))


def detectar_silencios(ffmpeg, caminho, limiar_db, duracao_minima):
    """Roda o filtro silencedetect e devolve a lista de trechos silenciosos."""
    cmd = [
        ffmpeg, "-hide_banner", "-nostdin", "-i", caminho,
        "-af", "silencedetect=noise={}dB:d={}".format(limiar_db, duracao_minima),
        "-f", "null", "-",
    ]
    saida = rodar(cmd).stderr or ""

    silencios = []
    inicio = None
    for m in re.finditer(r"silence_(start|end):\s*(-?[\d.]+)", saida):
        tipo, valor = m.group(1), float(m.group(2))
        if tipo == "start":
            inicio = max(0.0, valor)
        elif inicio is not None:
            silencios.append((inicio, valor))
            inicio = None
    if inicio is not None:
        silencios.append((inicio, None))  # silêncio que vai até o fim do vídeo
    return silencios


def montar_partes(duracao, silencios, alvo, minimo=None):
    """
    Escolhe onde dividir o vídeo em partes menores.

    Cada corte é empurrado para a pausa de fala mais próxima do alvo, dentro de uma
    janela de tolerância. É isso que faz a divisão cair entre frases em vez de no
    meio de uma palavra. Sem nenhuma pausa por perto, corta no tempo exato mesmo.
    """
    if alvo <= 0 or duracao <= 0:
        return [(0.0, duracao)]

    if minimo is None:
        minimo = max(2.0, alvo * 0.5)
    if duracao <= alvo + minimo:
        return [(0.0, duracao)]

    # o meio de cada silêncio é o ponto mais seguro para separar duas falas
    pontos = []
    for ini, fim in silencios:
        fim = duracao if fim is None else fim
        pontos.append((ini + fim) / 2.0)

    janela = max(3.0, alvo * 0.4)
    partes = []
    inicio = 0.0
    while duracao - inicio > alvo + minimo:
        alvo_absoluto = inicio + alvo
        melhor = None
        for ponto in pontos:
            if ponto <= inicio + minimo or ponto >= duracao - minimo:
                continue
            if abs(ponto - alvo_absoluto) > janela:
                continue
            if melhor is None or abs(ponto - alvo_absoluto) < abs(melhor - alvo_absoluto):
                melhor = ponto
        corte = melhor if melhor is not None else alvo_absoluto
        partes.append((inicio, corte))
        inicio = corte

    partes.append((inicio, duracao))
    return partes


def montar_trechos(duracao, silencios, pausa_restante, minimo=0.10):
    """
    Converte a lista de silêncios na lista de trechos que devem ser mantidos.

    `pausa_restante` é quanto de cada pausa continua no vídeo. Encurtar a pausa em
    vez de eliminá-la por completo é o que faz o corte soar natural: sem nenhuma
    respiração entre as frases o resultado fica atropelado.
    """
    folga = max(0.0, pausa_restante) / 2.0

    brutos = []
    cursor = 0.0
    for ini, fim in silencios:
        fim = duracao if fim is None else fim
        if ini - cursor > minimo:
            brutos.append([cursor, ini])
        cursor = max(cursor, fim)
    if duracao - cursor > minimo:
        brutos.append([cursor, duracao])

    if not brutos:
        return []

    for trecho in brutos:
        trecho[0] = max(0.0, trecho[0] - folga)
        trecho[1] = min(duracao, trecho[1] + folga)

    mesclados = []
    for trecho in brutos:
        if mesclados and trecho[0] <= mesclados[-1][1] + 0.001:
            mesclados[-1][1] = max(mesclados[-1][1], trecho[1])
        else:
            mesclados.append(trecho)
    return mesclados


def limitar_trechos(trechos, maximo=MAX_TRECHOS):
    """
    Garante que a expressão de corte não fique grande demais para o ffmpeg.

    Em vez de falhar, junta os trechos separados pelas menores pausas: as pausas
    curtas voltam para o vídeo e as longas continuam cortadas, que é justamente a
    ordem de prioridade que interessa. Devolve (trechos, quantas pausas voltaram).
    """
    if len(trechos) <= maximo:
        return trechos, 0

    por_lacuna = sorted(
        range(len(trechos) - 1),
        key=lambda i: trechos[i + 1][0] - trechos[i][1],
    )
    juntar = set(por_lacuna[:len(trechos) - maximo])

    novos = []
    for indice, trecho in enumerate(trechos):
        if novos and (indice - 1) in juntar:
            novos[-1][1] = trecho[1]
        else:
            novos.append(list(trecho))
    return novos, len(juntar)


def trechos_da_parte(trechos, inicio, fim, minimo=0.05):
    """Recorta a lista de trechos para uma parte, com os tempos relativos a ela."""
    locais = []
    for a, b in trechos:
        a2, b2 = max(a, inicio), min(b, fim)
        if b2 - a2 > minimo:
            locais.append((a2 - inicio, b2 - inicio))
    return locais


def expressao_select(trechos):
    """
    Monta a expressão do filtro select com os trechos que ficam no vídeo.

    O parser de expressões do ffmpeg aceita no máximo 100 somas seguidas: com 101
    termos ele aborta com "Cannot allocate memory". Um par de parênteses zera essa
    contagem, então os termos são agrupados, e o agrupamento se repete sobre os
    próprios grupos até caber. Assim qualquer quantidade de cortes passa.
    """
    termos = ["between(t,{:.3f},{:.3f})".format(a, b) for a, b in trechos]
    while len(termos) > TAMANHO_GRUPO:
        termos = [
            "(" + "+".join(termos[i:i + TAMANHO_GRUPO]) + ")"
            for i in range(0, len(termos), TAMANHO_GRUPO)
        ]
    return "+".join(termos)


def filtro_recorte(proporcao):
    """Recorte central para a proporção pedida, sempre em dimensões pares."""
    largura, altura = proporcao
    return (
        "crop=w='trunc(min(iw,ih*{l}/{a})/2)*2':h='trunc(min(ih,iw*{a}/{l})/2)*2'"
        .format(l=largura, a=altura)
    )


def dimensoes_recorte(largura, altura, proporcao):
    """Prevê o tamanho final do recorte, para mostrar na análise."""
    if not proporcao or not largura or not altura:
        return largura, altura
    pl, pa = proporcao
    return int(min(largura, altura * pl / pa) // 2 * 2), int(min(altura, largura * pa / pl) // 2 * 2)


def bitrate_audio_saida(bitrate_origem):
    """Escolhe um bitrate de áudio folgado em relação ao original, para não perder."""
    if bitrate_origem <= 0:
        return "192k"
    return "{}k".format(max(128, min(256, int(bitrate_origem / 1000 * 2))))


def tempo_para_segundos(texto):
    partes = texto.strip().split(":")
    try:
        if len(partes) == 3:
            return int(partes[0]) * 3600 + int(partes[1]) * 60 + float(partes[2])
        if len(partes) == 2:
            return int(partes[0]) * 60 + float(partes[1])
        return float(partes[0])
    except ValueError:
        return 0.0


def nome_livre(pasta, base, extensao=".mp4"):
    destino = os.path.join(pasta, base + extensao)
    contador = 1
    while os.path.exists(destino):
        destino = os.path.join(pasta, "{}_{}{}".format(base, contador, extensao))
        contador += 1
    return destino


# ------------------------------------------------------------------- interface


class EditorVideosApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Editor Rápido de Vídeos")
        self.root.geometry("770x930")
        self.root.minsize(730, 840)

        self.ffmpeg = encontrar_binario("ffmpeg")
        self.ffprobe = encontrar_binario("ffprobe")

        self.arquivos = []
        self.pasta_saida = tk.StringVar(value="")
        self.processo = None
        self.cancelado = False
        self.trabalhando = False
        self.fila = queue.Queue()

        self.var_qualidade_dl = tk.StringVar(value=QUALIDADE_DOWNLOAD_PADRAO)
        self.var_navegador = tk.StringVar(value="Sem cookies")
        self.var_playlist = tk.BooleanVar(value=False)
        self.var_apagar_baixado = tk.BooleanVar(value=True)
        self.pasta_download = tk.StringVar(value=self._pasta_download_padrao())

        self.var_dividir = tk.BooleanVar(value=True)
        self.var_duracao_parte = tk.StringVar(value="1.5")

        self.var_espelhar = tk.BooleanVar(value=True)
        self.var_espelhar_v = tk.BooleanVar(value=False)
        self.var_cortar = tk.BooleanVar(value=False)
        self.var_sem_audio = tk.BooleanVar(value=False)
        self.var_normalizar = tk.BooleanVar(value=False)
        self.var_limpar = tk.BooleanVar(value=True)

        self.var_giro = tk.StringVar(value="Não girar")
        self.var_formato = tk.StringVar(value="Manter o original")

        self.var_auto = tk.BooleanVar(value=True)
        self.var_limiar = tk.StringVar(value="-30")
        self.var_dur_silencio = tk.StringVar(value="0.30")
        self.var_pausa = tk.StringVar(value="0.20")
        self.var_qualidade = tk.StringVar(value=PERFIL_PADRAO)

        self._montar_interface()
        self._carregar_config()
        self._checar_dependencias()
        self.root.protocol("WM_DELETE_WINDOW", self._ao_fechar)
        self.root.after(120, self._consumir_fila)

    # ---------------------------------------------------------------- widgets

    def _pasta_download_padrao(self):
        area = os.path.join(os.path.expanduser("~"), "Desktop")
        return os.path.join(area if os.path.isdir(area) else PASTA_SCRIPT, "baixados")

    def _montar_interface(self):
        # a janela cresceu com as funções novas, então o conteúdo rola
        contorno = ttk.Frame(self.root)
        contorno.pack(fill="both", expand=True)
        self.tela = tk.Canvas(contorno, highlightthickness=0)
        rolagem = ttk.Scrollbar(contorno, orient="vertical", command=self.tela.yview)
        self.tela.configure(yscrollcommand=rolagem.set)
        self.tela.pack(side="left", fill="both", expand=True)
        rolagem.pack(side="right", fill="y")

        principal = ttk.Frame(self.tela, padding=14)
        janela = self.tela.create_window((0, 0), window=principal, anchor="nw")
        principal.bind("<Configure>", lambda _e: self.tela.configure(scrollregion=self.tela.bbox("all")))
        self.tela.bind("<Configure>", lambda e: self.tela.itemconfigure(janela, width=e.width))
        self.root.bind_all("<MouseWheel>", self._rolar)

        # 1. arquivos
        caixa_arquivos = ttk.LabelFrame(principal, text="1. Escolha os vídeos")
        caixa_arquivos.pack(fill="both", expand=False, pady=(0, 8))

        linha_botoes = ttk.Frame(caixa_arquivos)
        linha_botoes.pack(fill="x", padx=10, pady=(10, 6))
        ttk.Button(linha_botoes, text="Adicionar vídeos", command=self.adicionar_arquivos).pack(side="left")
        ttk.Button(linha_botoes, text="Remover selecionado", command=self.remover_selecionado).pack(side="left", padx=6)
        ttk.Button(linha_botoes, text="Limpar lista", command=self.limpar_lista).pack(side="left")

        moldura_lista = ttk.Frame(caixa_arquivos)
        moldura_lista.pack(fill="both", expand=True, padx=10, pady=(0, 4))
        self.lista = tk.Listbox(moldura_lista, height=4, activestyle="dotbox", selectmode="extended")
        barra = ttk.Scrollbar(moldura_lista, orient="vertical", command=self.lista.yview)
        self.lista.configure(yscrollcommand=barra.set)
        self.lista.bind("<Double-Button-1>", self._abrir_video_da_lista)
        self.lista.pack(side="left", fill="both", expand=True)
        barra.pack(side="right", fill="y")
        ttk.Label(
            caixa_arquivos, text="Duplo clique abre o vídeo no player padrão.",
            font=("Segoe UI", 8), foreground="gray",
        ).pack(anchor="w", padx=12, pady=(0, 8))

        # 1b. baixar de link
        caixa_link = ttk.LabelFrame(principal, text="Ou baixe por link (YouTube e outros sites)")
        caixa_link.pack(fill="x", pady=(0, 8))

        self.campo_urls = tk.Text(caixa_link, height=2, wrap="none", font=("Consolas", 9))
        self.campo_urls.pack(fill="x", padx=12, pady=(10, 4))
        ttk.Label(
            caixa_link, text="Um link por linha.",
            font=("Segoe UI", 8), foreground="gray",
        ).pack(anchor="w", padx=12)

        linha_dl = ttk.Frame(caixa_link)
        linha_dl.pack(fill="x", padx=12, pady=(6, 4))
        self.botao_baixar = ttk.Button(linha_dl, text="Baixar e pôr na fila", command=self.baixar)
        self.botao_baixar.pack(side="left")
        ttk.Label(linha_dl, text="Qualidade:").pack(side="left", padx=(14, 4))
        ttk.Combobox(
            linha_dl, textvariable=self.var_qualidade_dl, values=list(QUALIDADES_DOWNLOAD.keys()),
            state="readonly", width=18,
        ).pack(side="left")
        ttk.Label(linha_dl, text="Cookies:").pack(side="left", padx=(14, 4))
        ttk.Combobox(
            linha_dl, textvariable=self.var_navegador, values=list(NAVEGADORES.keys()),
            state="readonly", width=13,
        ).pack(side="left")
        ttk.Checkbutton(linha_dl, text="playlist inteira", variable=self.var_playlist).pack(side="left", padx=(14, 0))

        ttk.Checkbutton(
            caixa_link,
            text="Apagar o vídeo baixado depois de gerar os arquivos finais",
            variable=self.var_apagar_baixado,
        ).pack(anchor="w", padx=12, pady=(6, 0))

        linha_pasta_dl = ttk.Frame(caixa_link)
        linha_pasta_dl.pack(fill="x", padx=12, pady=(0, 4))
        ttk.Label(linha_pasta_dl, text="Salvar em:").pack(side="left")
        ttk.Entry(linha_pasta_dl, textvariable=self.pasta_download).pack(
            side="left", fill="x", expand=True, padx=(6, 0))
        ttk.Button(linha_pasta_dl, text="Escolher", command=self.escolher_pasta_download).pack(
            side="left", padx=(8, 0))

        ttk.Label(
            caixa_link,
            text=("Se o site pedir confirmação de que você não é robô, escolha o navegador em "
                  "COOKIES: o yt-dlp reaproveita a sessão já aberta nele."),
            font=("Segoe UI", 8), foreground="gray", wraplength=690,
        ).pack(anchor="w", padx=12, pady=(0, 10))

        # 2. divisão em partes
        caixa_divisao = ttk.LabelFrame(principal, text="2. Dividir em vídeos menores")
        caixa_divisao.pack(fill="x", pady=(0, 8))

        ttk.Checkbutton(
            caixa_divisao,
            text="Dividir cada vídeo em vários arquivos separados",
            variable=self.var_dividir,
            command=self._atualizar_ajustes,
        ).pack(anchor="w", padx=12, pady=(10, 4))

        linha_parte = ttk.Frame(caixa_divisao)
        linha_parte.pack(fill="x", padx=12, pady=(0, 4))
        ttk.Label(linha_parte, text="Duração de cada parte (minutos):").pack(side="left")
        self.spin_parte = ttk.Spinbox(
            linha_parte, from_=0.25, to=60.0, increment=0.25, format="%.2f",
            textvariable=self.var_duracao_parte, width=8,
        )
        self.spin_parte.pack(side="left", padx=(8, 0))
        self.rotulo_previsao = ttk.Label(linha_parte, text="", foreground="gray", font=("Segoe UI", 8))
        self.rotulo_previsao.pack(side="left", padx=(14, 0))
        self.var_duracao_parte.trace_add("write", lambda *_: self._atualizar_previsao())

        ttk.Label(
            caixa_divisao,
            text=(
                "Cada divisão é empurrada para a pausa de fala mais próxima, então o corte "
                "cai entre frases e não no meio de uma palavra. As partes saem numeradas: "
                "nome_parte01.mp4, nome_parte02.mp4 e assim por diante."
            ),
            font=("Segoe UI", 8), foreground="gray", wraplength=690,
        ).pack(anchor="w", padx=12, pady=(0, 10))

        # 3. opções
        caixa_opcoes = ttk.LabelFrame(principal, text="3. O que fazer com cada vídeo")
        caixa_opcoes.pack(fill="x", pady=(0, 8))

        ttk.Checkbutton(
            caixa_opcoes, text="Espelhar na horizontal (o que está à esquerda vai para a direita)",
            variable=self.var_espelhar,
        ).pack(anchor="w", padx=12, pady=(10, 2))
        ttk.Checkbutton(
            caixa_opcoes, text="Espelhar na vertical (de cabeça para baixo)",
            variable=self.var_espelhar_v,
        ).pack(anchor="w", padx=12, pady=2)
        ttk.Checkbutton(
            caixa_opcoes, text="Encurtar os trechos sem fala dentro do vídeo",
            variable=self.var_cortar, command=self._atualizar_ajustes,
        ).pack(anchor="w", padx=12, pady=2)
        ttk.Checkbutton(
            caixa_opcoes, text="Normalizar o volume (deixa o áudio parelho, padrão de streaming)",
            variable=self.var_normalizar,
        ).pack(anchor="w", padx=12, pady=2)
        ttk.Checkbutton(
            caixa_opcoes, text="Remover o som do vídeo (o arquivo final fica mudo)",
            variable=self.var_sem_audio,
        ).pack(anchor="w", padx=12, pady=2)
        ttk.Checkbutton(
            caixa_opcoes, text="Limpar o arquivo (apaga metadados e capítulos)",
            variable=self.var_limpar,
        ).pack(anchor="w", padx=12, pady=2)

        linha_giro = ttk.Frame(caixa_opcoes)
        linha_giro.pack(fill="x", padx=12, pady=(6, 12))
        ttk.Label(linha_giro, text="Girar:").pack(side="left")
        ttk.Combobox(
            linha_giro, textvariable=self.var_giro, values=list(GIROS.keys()), state="readonly", width=22
        ).pack(side="left", padx=(6, 20))
        ttk.Label(linha_giro, text="Formato:").pack(side="left")
        ttk.Combobox(
            linha_giro, textvariable=self.var_formato, values=list(FORMATOS.keys()), state="readonly", width=32
        ).pack(side="left", padx=6)

        # 4. ajustes de silêncio
        self.caixa_ajustes = ttk.LabelFrame(principal, text="4. Ajuste fino da detecção de pausas")
        self.caixa_ajustes.pack(fill="x", pady=(0, 8))

        self.check_auto = ttk.Checkbutton(
            self.caixa_ajustes, text="Detectar o nível de silêncio automaticamente (recomendado)",
            variable=self.var_auto, command=self._atualizar_ajustes,
        )
        self.check_auto.pack(anchor="w", padx=12, pady=(10, 4))

        grade = ttk.Frame(self.caixa_ajustes)
        grade.pack(fill="x", padx=12, pady=(0, 6))
        grade.columnconfigure(1, weight=1)
        grade.columnconfigure(3, weight=1)

        ttk.Label(grade, text="Silêncio abaixo de (dB):").grid(row=0, column=0, sticky="w", pady=4)
        self.spin_limiar = ttk.Spinbox(grade, from_=-60, to=-10, increment=1, textvariable=self.var_limiar, width=8)
        self.spin_limiar.grid(row=0, column=1, sticky="w", padx=(6, 20))

        ttk.Label(grade, text="Pausa mínima (s):").grid(row=0, column=2, sticky="w", pady=4)
        self.spin_dur = ttk.Spinbox(
            grade, from_=0.10, to=5.0, increment=0.05, format="%.2f", textvariable=self.var_dur_silencio, width=8
        )
        self.spin_dur.grid(row=0, column=3, sticky="w", padx=6)

        ttk.Label(grade, text="Pausa que sobra (s):").grid(row=1, column=0, sticky="w", pady=4)
        self.spin_pausa = ttk.Spinbox(
            grade, from_=0.0, to=1.0, increment=0.02, format="%.2f", textvariable=self.var_pausa, width=8
        )
        self.spin_pausa.grid(row=1, column=1, sticky="w", padx=(6, 20))

        ttk.Label(grade, text="Qualidade:").grid(row=1, column=2, sticky="w", pady=4)
        ttk.Combobox(
            grade, textvariable=self.var_qualidade, values=list(PERFIS_QUALIDADE.keys()),
            state="readonly", width=32,
        ).grid(row=1, column=3, sticky="w", padx=6)

        ttk.Label(
            self.caixa_ajustes,
            text=(
                "As pausas detectadas aqui servem para duas coisas: escolher onde dividir o "
                "vídeo e, se a opção estiver marcada, encurtar os trechos sem fala. "
                "\"Pausa que sobra\" mantém um respiro entre as falas."
            ),
            font=("Segoe UI", 8), foreground="gray", wraplength=690,
        ).pack(anchor="w", padx=12, pady=(0, 10))

        # 5. saída
        caixa_saida = ttk.LabelFrame(principal, text="5. Pasta de saída")
        caixa_saida.pack(fill="x", pady=(0, 8))
        linha_saida = ttk.Frame(caixa_saida)
        linha_saida.pack(fill="x", padx=12, pady=10)
        ttk.Entry(linha_saida, textvariable=self.pasta_saida).pack(side="left", fill="x", expand=True)
        ttk.Button(linha_saida, text="Escolher", command=self.escolher_pasta).pack(side="left", padx=(8, 0))
        ttk.Button(linha_saida, text="Abrir pasta", command=self.abrir_pasta).pack(side="left", padx=(6, 0))

        # 6. ação
        acoes = ttk.Frame(principal)
        acoes.pack(fill="x", pady=(0, 6))
        self.botao_analisar = ttk.Button(acoes, text="Analisar sem processar", command=self.analisar)
        self.botao_analisar.pack(side="left", padx=(0, 8))
        self.botao_processar = ttk.Button(acoes, text="6. Processar vídeos", command=self.iniciar)
        self.botao_processar.pack(side="left", fill="x", expand=True)
        self.botao_cancelar = ttk.Button(acoes, text="Cancelar", command=self.cancelar, state="disabled")
        self.botao_cancelar.pack(side="left", padx=(8, 0))

        self.barra_progresso = ttk.Progressbar(principal, mode="determinate", maximum=100)
        self.barra_progresso.pack(fill="x", pady=(0, 6))

        self.status = ttk.Label(principal, text="Pronto para começar.", anchor="w")
        self.status.pack(fill="x")

        moldura_log = ttk.Frame(principal)
        moldura_log.pack(fill="both", expand=True, pady=(8, 0))
        self.log = tk.Text(moldura_log, height=9, wrap="word", state="disabled", font=("Consolas", 9))
        barra_log = ttk.Scrollbar(moldura_log, orient="vertical", command=self.log.yview)
        self.log.configure(yscrollcommand=barra_log.set)
        self.log.pack(side="left", fill="both", expand=True)
        barra_log.pack(side="right", fill="y")

        rodape = ttk.Frame(principal)
        rodape.pack(fill="x", pady=(6, 0))
        ttk.Button(rodape, text="Salvar log", command=self.salvar_log).pack(side="left")
        ttk.Button(rodape, text="Limpar log", command=self.limpar_log).pack(side="left", padx=6)

        self._atualizar_ajustes()

    def _checar_dependencias(self):
        if not self.ffmpeg or not self.ffprobe:
            self.botao_processar.config(state="disabled")
            self.botao_analisar.config(state="disabled")
            self.status.config(text="ffmpeg não encontrado. Instale com: winget install Gyan.FFmpeg")
            self.escrever_log("ffmpeg/ffprobe não localizados no sistema.")
            self.escrever_log("Instale com o comando: winget install Gyan.FFmpeg")
        else:
            self.escrever_log("ffmpeg encontrado em: {}".format(self.ffmpeg))

    def _atualizar_ajustes(self):
        self.spin_parte.configure(state="normal" if self.var_dividir.get() else "disabled")
        # a detecção de pausas alimenta tanto a divisão quanto o encurtamento
        usa_pausas = self.var_dividir.get() or self.var_cortar.get()
        estado = "normal" if usa_pausas else "disabled"
        self.check_auto.configure(state=estado)
        self.spin_dur.configure(state=estado)
        self.spin_pausa.configure(state="normal" if self.var_cortar.get() else "disabled")
        self.spin_limiar.configure(state="normal" if (usa_pausas and not self.var_auto.get()) else "disabled")
        self._atualizar_previsao()

    def _atualizar_previsao(self):
        """Mostra quantas partes sairiam do primeiro vídeo da lista."""
        if not hasattr(self, "rotulo_previsao"):
            return
        if not self.var_dividir.get() or not self.arquivos:
            self.rotulo_previsao.config(text="")
            return
        try:
            alvo = float(self.var_duracao_parte.get()) * 60.0
        except ValueError:
            self.rotulo_previsao.config(text="")
            return
        duracao = getattr(self, "_duracao_primeiro", 0.0)
        if duracao <= 0 or alvo <= 0:
            self.rotulo_previsao.config(text="")
            return
        partes = montar_partes(duracao, [], alvo)
        self.rotulo_previsao.config(
            text="o primeiro vídeo ({}) daria {} partes".format(formatar_duracao(duracao), len(partes))
        )

    # ------------------------------------------------------------ preferências

    def _carregar_config(self):
        if not os.path.exists(CAMINHO_CONFIG):
            return
        try:
            with open(CAMINHO_CONFIG, encoding="utf-8") as arq:
                dados = json.load(arq)
        except (OSError, json.JSONDecodeError):
            return

        for chave, var in self._mapa_config().items():
            if chave in dados:
                try:
                    var.set(dados[chave])
                except tk.TclError:
                    pass
        if self.var_qualidade.get() not in PERFIS_QUALIDADE:
            self.var_qualidade.set(PERFIL_PADRAO)
        if self.var_giro.get() not in GIROS:
            self.var_giro.set("Não girar")
        if self.var_formato.get() not in FORMATOS:
            self.var_formato.set("Manter o original")
        if self.var_qualidade_dl.get() not in QUALIDADES_DOWNLOAD:
            self.var_qualidade_dl.set(QUALIDADE_DOWNLOAD_PADRAO)
        if self.var_navegador.get() not in NAVEGADORES:
            self.var_navegador.set("Sem cookies")
        self._atualizar_ajustes()

    def _mapa_config(self):
        return {
            "dividir": self.var_dividir,
            "duracao_parte": self.var_duracao_parte,
            "espelhar": self.var_espelhar,
            "espelhar_v": self.var_espelhar_v,
            "cortar": self.var_cortar,
            "sem_audio": self.var_sem_audio,
            "normalizar": self.var_normalizar,
            "limpar": self.var_limpar,
            "giro": self.var_giro,
            "formato": self.var_formato,
            "auto": self.var_auto,
            "limiar": self.var_limiar,
            "dur_silencio": self.var_dur_silencio,
            "pausa": self.var_pausa,
            "qualidade": self.var_qualidade,
            "pasta_saida": self.pasta_saida,
            "qualidade_dl": self.var_qualidade_dl,
            "navegador": self.var_navegador,
            "playlist": self.var_playlist,
            "apagar_baixado": self.var_apagar_baixado,
            "pasta_download": self.pasta_download,
        }

    def _salvar_config(self):
        dados = {chave: var.get() for chave, var in self._mapa_config().items()}
        try:
            with open(CAMINHO_CONFIG, "w", encoding="utf-8") as arq:
                json.dump(dados, arq, ensure_ascii=False, indent=2)
        except OSError:
            pass

    def _ao_fechar(self):
        self._salvar_config()
        self.cancelado = True
        if self.processo and self.processo.poll() is None:
            try:
                self.processo.kill()
            except OSError:
                pass
        self.root.destroy()

    # ------------------------------------------------------------------ ações

    def adicionar_arquivos(self):
        caminhos = filedialog.askopenfilenames(title="Selecione os vídeos", filetypes=EXTENSOES)
        for caminho in caminhos:
            if caminho not in self.arquivos:
                self.arquivos.append(caminho)
                self.lista.insert("end", os.path.basename(caminho))
        if self.arquivos and not self.pasta_saida.get():
            self.pasta_saida.set(os.path.join(os.path.dirname(self.arquivos[0]), "editados"))
        if self.arquivos and self.ffprobe:
            self._duracao_primeiro = inspecionar(self.ffprobe, self.arquivos[0])["duracao"]
            self._atualizar_previsao()
        self.status.config(text="{} vídeo(s) na fila.".format(len(self.arquivos)))

    def remover_selecionado(self):
        for indice in reversed(list(self.lista.curselection())):
            self.lista.delete(indice)
            del self.arquivos[indice]
        self.status.config(text="{} vídeo(s) na fila.".format(len(self.arquivos)))

    def limpar_lista(self):
        self.arquivos.clear()
        self.lista.delete(0, "end")
        self._duracao_primeiro = 0.0
        self._atualizar_previsao()
        self.status.config(text="Lista vazia.")

    def _abrir_video_da_lista(self, _evento=None):
        selecao = self.lista.curselection()
        if not selecao:
            return
        try:
            os.startfile(self.arquivos[selecao[0]])  # Windows
        except AttributeError:
            subprocess.Popen(["xdg-open", self.arquivos[selecao[0]]])
        except OSError as erro:
            messagebox.showerror("Não foi possível abrir", str(erro))

    def escolher_pasta(self):
        inicial = self.pasta_saida.get() or (os.path.dirname(self.arquivos[0]) if self.arquivos else os.getcwd())
        pasta = filedialog.askdirectory(title="Escolha a pasta de saída", initialdir=inicial)
        if pasta:
            self.pasta_saida.set(pasta)

    def abrir_pasta(self):
        pasta = self.pasta_saida.get().strip()
        if not pasta or not os.path.isdir(pasta):
            messagebox.showinfo(
                "Pasta de saída",
                "A pasta ainda não existe. Ela é criada ao processar, com o nome "
                "'editados', dentro da pasta do primeiro vídeo da lista.",
            )
            return
        try:
            os.startfile(pasta)  # Windows
        except AttributeError:
            subprocess.Popen(["xdg-open", pasta])

    def _rolar(self, evento):
        """Roda do mouse move a página, mas não quando o ponteiro está no log ou na lista."""
        alvo = self.root.winfo_containing(evento.x_root, evento.y_root)
        while alvo is not None:
            if isinstance(alvo, (tk.Text, tk.Listbox)):
                return
            alvo = getattr(alvo, "master", None)
        self.tela.yview_scroll(int(-evento.delta / 120), "units")

    def _garantir_ytdlp(self):
        """Confere o yt-dlp e oferece instalar. Devolve False se não dá para seguir."""
        if ytdlp_disponivel():
            return True

        querer = messagebox.askyesno(
            "yt-dlp não encontrado",
            "O download por link precisa do yt-dlp, que não está instalado neste "
            "Python:\n\n{}\n\nInstalar agora? Leva alguns segundos.".format(sys.executable),
        )
        if not querer:
            self.escrever_log("Download cancelado: yt-dlp não está instalado.")
            return False

        self.status.config(text="Instalando yt-dlp, aguarde...")
        self.escrever_log("Instalando yt-dlp em {}...".format(sys.executable))
        self.root.update()

        ok, detalhe = instalar_ytdlp()
        if ok and ytdlp_disponivel():
            self.escrever_log("yt-dlp instalado.")
            self.status.config(text="yt-dlp instalado.")
            return True

        self.escrever_log("Falha ao instalar o yt-dlp. {}".format(detalhe))
        messagebox.showerror(
            "Não deu para instalar",
            "Falha ao instalar o yt-dlp.\n\nRode manualmente:\n"
            "\"{}\" -m pip install yt-dlp".format(sys.executable),
        )
        self.status.config(text="Falha ao instalar o yt-dlp.")
        return False

    def _urls_pendentes(self):
        return [l.strip() for l in self.campo_urls.get("1.0", "end").splitlines() if l.strip()]

    def _coletar_download(self):
        """
        Resolve as opções de download na thread principal.

        Widget do Tkinter só pode ser lido pela thread que roda o mainloop: ler de
        dentro do worker levanta "main thread is not in main loop".
        """
        return {
            "pasta": self.pasta_download.get().strip() or self._pasta_download_padrao(),
            "formato": QUALIDADES_DOWNLOAD.get(
                self.var_qualidade_dl.get(), QUALIDADES_DOWNLOAD[QUALIDADE_DOWNLOAD_PADRAO]
            ),
            "playlist": self.var_playlist.get(),
            "navegador": NAVEGADORES.get(self.var_navegador.get()),
        }

    def _pasta_saida_padrao(self):
        if self.arquivos:
            return os.path.join(os.path.dirname(self.arquivos[0]), "editados")
        base = self.pasta_download.get().strip() or self._pasta_download_padrao()
        return os.path.join(os.path.dirname(base) or PASTA_SCRIPT, "editados")

    def escolher_pasta_download(self):
        pasta = filedialog.askdirectory(
            title="Onde salvar os downloads",
            initialdir=self.pasta_download.get() or PASTA_SCRIPT,
        )
        if pasta:
            self.pasta_download.set(pasta)

    def baixar(self):
        if self.trabalhando:
            return
        urls = [l.strip() for l in self.campo_urls.get("1.0", "end").splitlines() if l.strip()]
        if not urls:
            messagebox.showwarning("Nenhum link", "Cole pelo menos um link para baixar.")
            return
        if not self._garantir_ytdlp():
            return
        pasta = self.pasta_download.get().strip() or self._pasta_download_padrao()
        try:
            os.makedirs(pasta, exist_ok=True)
        except OSError as erro:
            messagebox.showerror("Pasta inválida", "Não foi possível criar a pasta:\n{}".format(erro))
            return
        self.pasta_download.set(pasta)
        self._salvar_config()
        opcoes_dl = self._coletar_download()

        self.escrever_log("")
        self.escrever_log("--- Baixando {} link(s) para {} ---".format(len(urls), pasta))
        self.trabalhando = True
        self.cancelado = False
        self._travar(True)
        self.barra_progresso["value"] = 0
        threading.Thread(target=self._worker_download, args=(urls, opcoes_dl), daemon=True).start()

    def _worker_completo(self, urls, arquivos, opcoes, apenas_analisar, opcoes_dl):
        """Baixa os links pendentes e emenda direto no processamento."""
        arquivos = list(arquivos)
        descartaveis = set()
        if urls:
            self.fila.put((
                "log",
                "--- Baixando {} link(s) para {} ---".format(len(urls), opcoes_dl["pasta"]),
            ))
            baixados = self._baixar(urls, opcoes_dl)
            if baixados is None:
                return
            for caminho in baixados:
                if caminho not in arquivos:
                    arquivos.append(caminho)
            descartaveis = set(baixados)

        if self.cancelado:
            self.fila.put(("status", "Cancelado pelo usuário."))
            self.fila.put(("fim", ""))
            return
        if not arquivos:
            self.fila.put(("status", "Nada para processar."))
            self.fila.put(("log", "Nenhum arquivo disponível: o download não trouxe nada."))
            self.fila.put(("fim", ""))
            return

        if apenas_analisar:
            self._worker_analise(arquivos, opcoes)
        else:
            self._worker(arquivos, opcoes, descartaveis)

    def _baixar(self, urls, opcoes_dl):
        """Baixa a lista de links. Devolve os caminhos, ou None se estourou erro."""
        try:
            os.makedirs(opcoes_dl["pasta"], exist_ok=True)
            baixados, falhas = baixar_videos(
                urls,
                opcoes_dl["pasta"],
                opcoes_dl["formato"],
                opcoes_dl["playlist"],
                opcoes_dl["navegador"],
                self.ffmpeg,
                ao_progresso=lambda v: self.fila.put(("progresso", v)),
                ao_log=lambda t: self.fila.put(("log", t)),
                cancelado=lambda: self.cancelado,
            )
        except Exception as erro:  # noqa: BLE001
            self.fila.put(("log", "ERRO no download: {}".format(erro)))
            self.fila.put(("status", "Falha no download."))
            self.fila.put(("fim", ""))
            return None

        self.fila.put(("baixados", baixados))
        # só os links que falharam continuam no campo, para poder tentar de novo
        self.fila.put(("urls_restantes", falhas))

        removidos, megabytes, orfaos = limpar_restos_download(opcoes_dl["pasta"])
        if removidos:
            self.fila.put((
                "log",
                "     {} resto(s) de download apagados, {} liberados".format(
                    removidos, formatar_tamanho(megabytes)),
            ))
        if orfaos:
            self.fila.put((
                "log",
                "     aviso: {} pedaço(s) de faixa sobraram de uma junção que falhou, "
                "confira a pasta de downloads".format(len(orfaos)),
            ))
        return baixados

    def _worker_download(self, urls, opcoes_dl):
        baixados = self._baixar(urls, opcoes_dl)
        if baixados is None:
            return
        pasta = opcoes_dl["pasta"]
        if self.cancelado:
            self.fila.put(("status", "Download cancelado."))
            self.fila.put(("fim", ""))
            return
        self.fila.put(("status", "{} arquivo(s) baixado(s).".format(len(baixados))))
        if baixados:
            self.fila.put((
                "fim",
                "{} arquivo(s) baixado(s) e postos na fila.\n\nPasta: {}".format(len(baixados), pasta),
            ))
        else:
            self.fila.put(("fim", ""))

    def _remover_da_lista(self, caminhos):
        """Tira da fila os arquivos que deixaram de existir."""
        for caminho in caminhos:
            if caminho in self.arquivos:
                indice = self.arquivos.index(caminho)
                del self.arquivos[indice]
                self.lista.delete(indice)
        self.status.config(text="{} vídeo(s) na fila.".format(len(self.arquivos)))

    def _receber_baixados(self, caminhos):
        novos = 0
        for caminho in caminhos:
            if caminho not in self.arquivos:
                self.arquivos.append(caminho)
                self.lista.insert("end", os.path.basename(caminho))
                novos += 1
        if novos and not self.pasta_saida.get():
            self.pasta_saida.set(os.path.join(os.path.dirname(self.arquivos[0]), "editados"))
        if self.arquivos and self.ffprobe:
            self._duracao_primeiro = inspecionar(self.ffprobe, self.arquivos[0])["duracao"]
            self._atualizar_previsao()

    def escrever_log(self, texto):
        self.log.configure(state="normal")
        self.log.insert("end", texto + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def limpar_log(self):
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")

    def salvar_log(self):
        conteudo = self.log.get("1.0", "end").strip()
        if not conteudo:
            messagebox.showinfo("Log vazio", "Não há nada para salvar ainda.")
            return
        destino = filedialog.asksaveasfilename(
            title="Salvar log", defaultextension=".txt", initialfile="log_editor_videos.txt",
            filetypes=[("Texto", "*.txt")], initialdir=self.pasta_saida.get() or PASTA_SCRIPT,
        )
        if not destino:
            return
        try:
            with open(destino, "w", encoding="utf-8") as arq:
                arq.write(conteudo + "\n")
            self.escrever_log("Log salvo em: {}".format(destino))
        except OSError as erro:
            messagebox.showerror("Erro ao salvar", str(erro))

    # ------------------------------------------------------- coleta de opções

    def _coletar_opcoes(self, exigir_pasta=True):
        pasta = self.pasta_saida.get().strip() or self._pasta_saida_padrao()
        if exigir_pasta:
            try:
                os.makedirs(pasta, exist_ok=True)
            except OSError as erro:
                messagebox.showerror("Pasta inválida", "Não foi possível criar a pasta de saída:\n{}".format(erro))
                return None
            self.pasta_saida.set(pasta)

        try:
            return {
                "dividir": self.var_dividir.get(),
                "duracao_parte": float(self.var_duracao_parte.get()) * 60.0,
                "espelhar": self.var_espelhar.get(),
                "espelhar_v": self.var_espelhar_v.get(),
                "cortar": self.var_cortar.get(),
                "sem_audio": self.var_sem_audio.get(),
                "normalizar": self.var_normalizar.get(),
                "limpar": self.var_limpar.get(),
                "apagar_baixados": self.var_apagar_baixado.get(),
                "giro": self.var_giro.get(),
                "formato": self.var_formato.get(),
                "auto": self.var_auto.get(),
                "limiar": float(self.var_limiar.get()),
                "dur_silencio": float(self.var_dur_silencio.get()),
                "pausa": float(self.var_pausa.get()),
                "perfil": PERFIS_QUALIDADE[self.var_qualidade.get()],
                "pasta": pasta,
            }
        except (ValueError, KeyError):
            messagebox.showerror("Ajustes inválidos", "Confira os valores numéricos das caixas de ajuste.")
            return None

    def _descrever_opcoes(self, opcoes):
        """Lista o que está ligado, para o resultado nunca surpreender."""
        itens = []
        if opcoes["dividir"]:
            itens.append("dividir em partes de {}".format(formatar_duracao(opcoes["duracao_parte"])))
        if opcoes["cortar"]:
            itens.append("encurtar pausas")
        if opcoes["espelhar"]:
            itens.append("espelhar na horizontal")
        if opcoes["espelhar_v"]:
            itens.append("espelhar na vertical")
        if GIROS[opcoes["giro"]]:
            itens.append("girar {}".format(opcoes["giro"].lower()))
        if FORMATOS[opcoes["formato"]]:
            itens.append("recortar em {}".format(opcoes["formato"].split(" (")[0].lower()))
        if opcoes["normalizar"]:
            itens.append("normalizar o volume")
        if opcoes["sem_audio"]:
            itens.append("REMOVER O SOM")
        if opcoes["limpar"]:
            itens.append("limpar metadados")
        if opcoes.get("apagar_baixados"):
            itens.append("apagar o baixado no fim")
        itens.append("qualidade CRF {}".format(opcoes["perfil"]["crf"]))
        return ", ".join(itens)

    def _travar(self, travado):
        estado = "disabled" if travado else "normal"
        self.botao_processar.config(state=estado)
        self.botao_analisar.config(state=estado)
        self.botao_baixar.config(state=estado)
        self.botao_cancelar.config(state="normal" if travado else "disabled")

    def analisar(self):
        if self.trabalhando:
            return
        urls = self._urls_pendentes()
        if not self.arquivos and not urls:
            messagebox.showwarning(
                "Nenhum vídeo",
                "Adicione um vídeo à lista ou cole um link para baixar.",
            )
            return
        if urls and not self._garantir_ytdlp():
            return
        opcoes = self._coletar_opcoes(exigir_pasta=False)
        if opcoes is None:
            return
        self.trabalhando = True
        self.cancelado = False
        self._travar(True)
        self.escrever_log("")
        self.escrever_log("--- Análise (nenhum arquivo é gravado) ---")
        self.escrever_log("Opções ativas: {}".format(self._descrever_opcoes(opcoes)))
        threading.Thread(
            target=self._worker_completo,
            args=(urls, list(self.arquivos), opcoes, True, self._coletar_download()),
            daemon=True,
        ).start()

    def iniciar(self):
        if self.trabalhando:
            return
        urls = self._urls_pendentes()
        if not self.arquivos and not urls:
            messagebox.showwarning(
                "Nenhum vídeo",
                "Adicione um vídeo à lista ou cole um link para baixar.",
            )
            return
        if urls and not self._garantir_ytdlp():
            return
        opcoes = self._coletar_opcoes()
        if opcoes is None:
            return
        if not any((
            opcoes["dividir"], opcoes["espelhar"], opcoes["espelhar_v"], opcoes["cortar"],
            opcoes["sem_audio"], opcoes["normalizar"], opcoes["limpar"],
            GIROS[opcoes["giro"]], FORMATOS[opcoes["formato"]],
        )):
            messagebox.showwarning("Nenhuma opção", "Marque pelo menos uma opção de edição.")
            return

        self._salvar_config()
        self.escrever_log("")
        self.escrever_log("Opções ativas: {}".format(self._descrever_opcoes(opcoes)))
        self.escrever_log("Salvando em: {}".format(opcoes["pasta"]))

        self.trabalhando = True
        self.cancelado = False
        self._travar(True)
        self.barra_progresso["value"] = 0
        threading.Thread(
            target=self._worker_completo,
            args=(urls, list(self.arquivos), opcoes, False, self._coletar_download()),
            daemon=True,
        ).start()

    def cancelar(self):
        self.cancelado = True
        if self.processo and self.processo.poll() is None:
            try:
                self.processo.kill()
            except OSError:
                pass
        self.fila.put(("status", "Cancelando..."))

    # ------------------------------------------------------- fila / mensagens

    def _consumir_fila(self):
        try:
            while True:
                tipo, dado = self.fila.get_nowait()
                if tipo == "status":
                    self.status.config(text=dado)
                elif tipo == "log":
                    self.escrever_log(dado)
                elif tipo == "progresso":
                    self.barra_progresso["value"] = dado
                elif tipo == "baixados":
                    self._receber_baixados(dado)
                elif tipo == "remover_da_lista":
                    self._remover_da_lista(dado)
                elif tipo == "urls_restantes":
                    self.campo_urls.delete("1.0", "end")
                    if dado:
                        self.campo_urls.insert("1.0", "\n".join(dado))
                elif tipo == "fim":
                    self.trabalhando = False
                    self._travar(False)
                    self.barra_progresso["value"] = 0 if self.cancelado else 100
                    if dado:
                        if messagebox.askyesno("Concluído", dado + "\n\nAbrir a pasta agora?"):
                            self.abrir_pasta()
        except queue.Empty:
            pass
        self.root.after(120, self._consumir_fila)

    # ------------------------------------------------------- pausas e partes

    def _detectar_pausas(self, entrada, info, opcoes, nome):
        """Roda a detecção de silêncio uma única vez por vídeo."""
        if not info["tem_audio"]:
            self.fila.put(("log", "     aviso: vídeo sem faixa de áudio, as pausas não podem ser detectadas"))
            return []

        limiar = opcoes["limiar"]
        if opcoes["auto"]:
            self.fila.put(("status", "Analisando o volume de {}...".format(nome)))
            medido = limiar_automatico(self.ffmpeg, entrada)
            if medido is None:
                self.fila.put(("log", "     aviso: não deu para medir o volume, usando {:.0f} dB".format(limiar)))
            else:
                limiar = medido
                self.fila.put(("log", "     limiar medido no próprio vídeo: {:.1f} dB".format(limiar)))

        self.fila.put(("status", "Procurando pausas em {}...".format(nome)))
        return detectar_silencios(self.ffmpeg, entrada, limiar, opcoes["dur_silencio"])

    def _calcular_partes(self, info, opcoes, silencios):
        """Divide a linha do tempo em partes e conta quantas caíram em pausa."""
        partes = montar_partes(info["duracao"], silencios, opcoes["duracao_parte"])
        if len(partes) <= 1:
            self.fila.put((
                "log",
                "     vídeo curto demais para dividir em partes de {}".format(
                    formatar_duracao(opcoes["duracao_parte"])
                ),
            ))
            return partes

        # confere quantos cortes ficaram dentro de um silêncio de verdade
        certeiros = 0
        for inicio, _fim in partes[1:]:
            for ini_s, fim_s in silencios:
                fim_s = info["duracao"] if fim_s is None else fim_s
                if ini_s <= inicio <= fim_s:
                    certeiros += 1
                    break

        self.fila.put((
            "log",
            "     {} partes de ~{}, {} de {} cortes caíram numa pausa de fala".format(
                len(partes), formatar_duracao(opcoes["duracao_parte"]), certeiros, len(partes) - 1
            ),
        ))
        return partes

    def _calcular_trechos(self, info, opcoes, silencios):
        """Trechos que ficam no vídeo depois de encurtar as pausas."""
        if not silencios:
            return []
        trechos = montar_trechos(info["duracao"], silencios, opcoes["pausa"])
        if not trechos:
            raise RuntimeError("o vídeo inteiro foi lido como silêncio, use o modo manual com um limiar mais baixo")

        trechos, juntados = limitar_trechos(trechos)
        if juntados:
            self.fila.put((
                "log",
                "     {} pausas curtas foram mantidas: acima de {} cortes o ffmpeg não "
                "aguenta a expressão".format(juntados, MAX_TRECHOS),
            ))

        removido = info["duracao"] - sum(b - a for a, b in trechos)
        if removido < 0.20:
            self.fila.put(("log", "     nenhuma pausa relevante para encurtar"))
            return []

        self.fila.put((
            "log",
            "     encurtando pausas: {:.1f}s a menos ({:.1f}%)".format(
                removido, 100.0 * removido / info["duracao"]
            ),
        ))
        return trechos

    # -------------------------------------------------------------- análise

    def _worker_analise(self, arquivos, opcoes):
        for indice, entrada in enumerate(arquivos, start=1):
            if self.cancelado:
                break
            nome = os.path.basename(entrada)
            self.fila.put(("status", "Analisando [{}/{}] {}".format(indice, len(arquivos), nome)))
            try:
                info = inspecionar(self.ffprobe, entrada)
                if info["duracao"] <= 0:
                    raise RuntimeError("não foi possível ler o arquivo")

                self.fila.put(("log", nome))
                self.fila.put((
                    "log",
                    "     {}x{} a {:.0f} fps, {}, vídeo {:.0f} kbps, áudio {}".format(
                        info["largura"], info["altura"], info["fps"], formatar_duracao(info["duracao"]),
                        info["bitrate_video"] / 1000,
                        "{:.0f} kbps".format(info["bitrate_audio"] / 1000) if info["tem_audio"] else "nenhum",
                    ),
                ))

                proporcao = FORMATOS[opcoes["formato"]]
                if proporcao:
                    nl, na = dimensoes_recorte(info["largura"], info["altura"], proporcao)
                    self.fila.put(("log", "     recorte de formato: {}x{}".format(nl, na)))

                silencios = []
                if opcoes["dividir"] or opcoes["cortar"]:
                    silencios = self._detectar_pausas(entrada, info, opcoes, nome)
                    self.fila.put(("log", "     {} pausas de fala encontradas".format(len(silencios))))

                if opcoes["dividir"]:
                    partes = self._calcular_partes(info, opcoes, silencios)
                    for numero, (ini, fim) in enumerate(partes, start=1):
                        self.fila.put((
                            "log",
                            "       parte {:02d}: {} até {}  ({})".format(
                                numero, formatar_duracao(ini), formatar_duracao(fim),
                                formatar_duracao(fim - ini),
                            ),
                        ))
                if opcoes["cortar"]:
                    self._calcular_trechos(info, opcoes, silencios)
            except Exception as erro:  # noqa: BLE001
                self.fila.put(("log", "ERRO {}: {}".format(nome, erro)))

        self.fila.put(("status", "Análise concluída." if not self.cancelado else "Análise cancelada."))
        self.fila.put(("fim", ""))

    # ---------------------------------------------------------------- worker

    def _worker(self, arquivos, opcoes, descartaveis=None):
        descartaveis = descartaveis or set()
        apagados = []
        # a pasta pode ter sumido entre a escolha e o processamento
        try:
            os.makedirs(opcoes["pasta"], exist_ok=True)
        except OSError as erro:
            self.fila.put(("log", "ERRO: não deu para criar {}: {}".format(opcoes["pasta"], erro)))
            self.fila.put(("status", "Pasta de saída inacessível."))
            self.fila.put(("fim", ""))
            return

        total = len(arquivos)
        sucessos = 0
        falhas = 0
        gerados = 0
        antes = 0.0
        depois = 0.0
        comeco = time.time()

        for indice, entrada in enumerate(arquivos, start=1):
            if self.cancelado:
                break
            nome = os.path.basename(entrada)
            self.fila.put(("status", "[{}/{}] {}".format(indice, total, nome)))
            self.fila.put(("progresso", 0))
            marca = time.time()
            try:
                saidas, resumo, tempos = self._processar(entrada, opcoes)
                if saidas:
                    sucessos += 1
                    gerados += len(saidas)
                    antes += tempos[0]
                    depois += tempos[1]
                    self.fila.put(("log", "OK   {}  ->  {} arquivo(s)".format(nome, len(saidas))))
                    self.fila.put(("log", "     {}".format(resumo)))
                    self.fila.put(("log", "     levou {}".format(formatar_duracao(time.time() - marca))))
                    # só apaga o que esta rodada baixou, e só depois de dar certo
                    if opcoes.get("apagar_baixados") and entrada in descartaveis:
                        try:
                            tamanho = os.path.getsize(entrada) / 1048576
                            os.unlink(entrada)
                            apagados.append(entrada)
                            self.fila.put((
                                "log",
                                "     baixado apagado, {} liberados".format(formatar_tamanho(tamanho)),
                            ))
                        except OSError as falha:
                            self.fila.put(("log", "     aviso: não deu para apagar o baixado: {}".format(falha)))
            except Exception as erro:  # noqa: BLE001
                falhas += 1
                self.fila.put(("log", "ERRO {}: {}".format(nome, erro)))

        if self.cancelado:
            self.fila.put(("status", "Cancelado pelo usuário."))
            self.fila.put(("fim", ""))
            return

        gasto = formatar_duracao(time.time() - comeco)
        if apagados:
            self.fila.put(("remover_da_lista", apagados))
        self.fila.put(("status", "Concluído: {} ok, {} com erro, em {}.".format(sucessos, falhas, gasto)))

        linhas = ["{} vídeo(s) de entrada geraram {} arquivo(s), em {}.".format(sucessos, gerados, gasto)]
        if sucessos:
            cortado = antes - depois
            if cortado >= 0.2:
                linhas.append("")
                linhas.append("Pausas encurtadas: {:.1f}s a menos no total.".format(cortado))
        linhas.append("")
        linhas.append("Pasta: {}".format(opcoes["pasta"]))
        self.fila.put(("fim", "\n".join(linhas)))

    def _processar(self, entrada, opcoes):
        info = inspecionar(self.ffprobe, entrada)
        if info["duracao"] <= 0:
            raise RuntimeError("não foi possível ler a duração do vídeo")
        if not info["tem_video"]:
            raise RuntimeError("o arquivo não tem faixa de vídeo")

        nome = os.path.basename(entrada)
        silencios = []
        if opcoes["dividir"] or opcoes["cortar"]:
            silencios = self._detectar_pausas(entrada, info, opcoes, nome)

        trechos = self._calcular_trechos(info, opcoes, silencios) if opcoes["cortar"] else []
        partes = self._calcular_partes(info, opcoes, silencios) if opcoes["dividir"] else [(0.0, info["duracao"])]

        base = os.path.splitext(nome)[0]
        digitos = max(2, len(str(len(partes))))
        saidas = []
        duracao_total = 0.0

        for numero, (inicio, fim) in enumerate(partes, start=1):
            if self.cancelado:
                break
            if len(partes) > 1:
                sufixo = "_parte{:0{}d}".format(numero, digitos)
                self.fila.put(("status", "{} parte {}/{}".format(nome, numero, len(partes))))
            else:
                sufixo = "_editado"
            saida = nome_livre(opcoes["pasta"], base + sufixo, ".mp4")
            final = self._processar_parte(entrada, info, opcoes, trechos, inicio, fim, saida, len(partes) > 1)
            saidas.append(saida)
            duracao_total += final["duracao"]

        if self.cancelado:
            for arquivo in saidas:
                try:
                    os.unlink(arquivo)
                except OSError:
                    pass
            return [], "", (0.0, 0.0)

        resumo = self._resumir(info, opcoes, trechos, partes, saidas, duracao_total)
        return saidas, resumo, (info["duracao"], duracao_total)

    def _processar_parte(self, entrada, info, opcoes, trechos, inicio, fim, saida, dividindo):
        manter_audio = info["tem_audio"] and not opcoes["sem_audio"]
        normalizar = manter_audio and opcoes["normalizar"]
        proporcao = FORMATOS[opcoes["formato"]]
        duracao_parte = fim - inicio

        # os tempos do filtro passam a contar do início da parte
        locais = trechos_da_parte(trechos, inicio, fim) if trechos else []
        cortando = bool(locais) and sum(b - a for a, b in locais) < duracao_parte - 0.05
        duracao_prevista = sum(b - a for a, b in locais) if cortando else duracao_parte

        # ordem importa: corta o tempo, gira, espelha e só então recorta o quadro
        filtros_video = []
        if cortando:
            filtros_video.append("select='{}'".format(expressao_select(locais)))
            filtros_video.append("setpts=N/FRAME_RATE/TB")
        filtros_video.extend(GIROS[opcoes["giro"]])
        if opcoes["espelhar"]:
            filtros_video.append("hflip")
        if opcoes["espelhar_v"]:
            filtros_video.append("vflip")
        if proporcao:
            filtros_video.append(filtro_recorte(proporcao))

        filtros_audio = []
        if manter_audio and cortando:
            filtros_audio.append("aselect='{}'".format(expressao_select(locais)))
            filtros_audio.append("asetpts=N/SR/TB")
        if normalizar:
            filtros_audio.append("loudnorm=I=-16:TP=-1.5:LRA=11")

        cmd = [self.ffmpeg, "-y", "-hide_banner", "-nostdin"]
        if dividindo:
            cmd += ["-ss", "{:.3f}".format(inicio), "-to", "{:.3f}".format(fim)]
        cmd += ["-i", entrada]

        script_temp = None
        if filtros_video or filtros_audio:
            linhas = []
            if filtros_video:
                linhas.append("[0:v]" + ",".join(filtros_video + ["format=yuv420p"]) + "[v]")
            if filtros_audio:
                linhas.append("[0:a]" + ",".join(filtros_audio) + "[a]")
            # o filtro pode ficar longo demais para a linha de comando do Windows
            script_temp = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8")
            script_temp.write(";\n".join(linhas))
            script_temp.close()
            cmd += ["-filter_complex_script", script_temp.name]

        cmd += ["-map", "[v]" if filtros_video else "0:v:0"]
        if manter_audio:
            cmd += ["-map", "[a]" if filtros_audio else "0:a:0"]

        # dividir exige recodificar: com -c copy o corte pula para o keyframe
        # anterior e cai no meio da fala, que é justamente o que se quer evitar
        if filtros_video or dividindo:
            cmd += [
                "-c:v", "libx264",
                "-preset", opcoes["perfil"]["preset"],
                "-crf", str(opcoes["perfil"]["crf"]),
                "-pix_fmt", "yuv420p",
            ]
        else:
            cmd += ["-c:v", "copy"]

        if not manter_audio:
            cmd += ["-an"]
        elif filtros_audio or dividindo:
            cmd += ["-c:a", "aac", "-b:a", bitrate_audio_saida(info["bitrate_audio"])]
        else:
            cmd += ["-c:a", "copy"]

        if opcoes["limpar"]:
            cmd += ["-map_metadata", "-1", "-map_chapters", "-1", "-fflags", "+bitexact"]

        cmd += ["-movflags", "+faststart", "-progress", "pipe:1", "-nostats", saida]

        try:
            self._executar(cmd, duracao_prevista)
        finally:
            if script_temp:
                try:
                    os.unlink(script_temp.name)
                except OSError:
                    pass

        if self.cancelado:
            return {"duracao": 0.0, "largura": 0, "altura": 0}
        return self._conferir(saida, duracao_prevista, manter_audio)

    def _conferir(self, saida, duracao_esperada, manter_audio):
        """Confere o arquivo gerado, para não entregar resultado quebrado em silêncio."""
        final = inspecionar(self.ffprobe, saida)
        if not final["tem_video"] or final["duracao"] <= 0:
            raise RuntimeError("o arquivo gerado saiu inválido")
        if manter_audio and not final["tem_audio"]:
            raise RuntimeError("o arquivo gerado ficou sem áudio")
        if duracao_esperada > 0 and abs(final["duracao"] - duracao_esperada) > max(1.0, duracao_esperada * 0.05):
            self.fila.put((
                "log",
                "     aviso: {} ficou com {:.1f}s, previsto {:.1f}s".format(
                    os.path.basename(saida), final["duracao"], duracao_esperada
                ),
            ))
        return final

    def _resumir(self, info, opcoes, trechos, partes, saidas, duracao_total):
        itens = []
        if len(partes) > 1:
            itens.append("{} partes de ~{}".format(len(partes), formatar_duracao(duracao_total / len(partes))))
        if trechos:
            itens.append("pausas encurtadas")
        if opcoes["espelhar"]:
            itens.append("espelhado")
        if opcoes["espelhar_v"]:
            itens.append("invertido na vertical")
        if GIROS[opcoes["giro"]]:
            itens.append("girado {}".format(opcoes["giro"].lower()))
        if FORMATOS[opcoes["formato"]]:
            nl, na = dimensoes_recorte(info["largura"], info["altura"], FORMATOS[opcoes["formato"]])
            itens.append("{}x{}".format(nl, na))
        if info["tem_audio"] and opcoes["sem_audio"]:
            itens.append("sem áudio")
        elif opcoes["normalizar"]:
            itens.append("volume normalizado")
        if opcoes["limpar"]:
            itens.append("metadados limpos")
        try:
            total = sum(os.path.getsize(a) for a in saidas) / 1048576
            itens.append("{:.1f} MB no total".format(total))
        except OSError:
            pass
        return ", ".join(itens)

    def _executar(self, cmd, duracao_alvo):
        self.processo = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            creationflags=SEM_JANELA,
        )
        cauda = deque(maxlen=25)
        for linha in self.processo.stdout:
            linha = linha.rstrip()
            if not linha:
                continue
            cauda.append(linha)
            if linha.startswith("out_time=") and duracao_alvo > 0:
                segundos = tempo_para_segundos(linha.split("=", 1)[1])
                self.fila.put(("progresso", max(0, min(100, (segundos / duracao_alvo) * 100))))
        self.processo.wait()
        codigo = self.processo.returncode
        self.processo = None

        if self.cancelado:
            return
        if codigo != 0:
            detalhe = " | ".join(l for l in cauda if not re.match(r"^[a-z_]+=", l))
            raise RuntimeError("ffmpeg falhou (código {}). {}".format(codigo, detalhe[-400:].strip()))
        self.fila.put(("progresso", 100))


def main():
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except tk.TclError:
        pass
    EditorVideosApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
