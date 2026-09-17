"""Apaga credenciais dos arquivos de texto da CÓPIA de backup (nunca dos originais).

Ordem do Anderson (17/09/2026): o backup leva a memória e a documentação, mas nenhuma
chave de API, senha ou chave SSH. Como muitas chaves estão no meio de textos (CLAUDE.md,
skills, memórias), este passo troca cada uma por <<REMOVIDO>> e lista o que apagou.
Uso: python limpar.py PASTA [PASTA...]
"""
import re, sys, os, io

TEXTO = {'.md', '.txt', '.json', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.sh', '.ps1', '.php', '.yml', '.yaml',
         '.toml', '.ini', '.cfg', '.conf', '.csv', '.html', '.htm', '.xml', '.sql', '.env', '.example', ''}
MARCA = '<<REMOVIDO>>'
GENERICO_EM = {'.md', '.txt', '.json', '.csv', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf', '.env', '.example', ''}

# valor após rótulo típico de segredo (chave: x, token=x, senha x, password: x, Bearer x)
ROTULO = re.compile(
    r'(?i)\b(api[_ -]?key|apikey|access[_ -]?id|secret[_ -]?key|client[_ -]?secret|secret|token|bearer|senha|password|passwd|pwd|'
    r'chave(?: de api| secreta| privada)?|authorization|auth|x-api-key|private[_ -]?key|app[_ -]?password|senha de aplicativo|'
    r'[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASS|PWD|CHAT_ID|DATABASE_URI|DATABASE_URL))'
    r'(["\']?(?:\*\*)?[ \t]*(?:[:=|][ \t*|]*|[eé][ \t]+|[ \t]+))(["\'`]?)([^\s"\'`,;)\]|]{8,})')
TEM_DIGITO = re.compile(r'\d')
TEM_LETRA = re.compile(r'[A-Za-z]')
# formatos conhecidos, mesmo sem rótulo
PADROES = [
    re.compile(r'(?<![A-Za-z0-9])sk-(?:ant-|proj-|or-)?[A-Za-z0-9_-]{20,}'),                     # OpenAI, Anthropic, OpenRouter
    re.compile(r'\b(?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}'),        # GitHub
    re.compile(r'\bxox[abp]-[A-Za-z0-9-]{20,}'),                                   # Slack
    re.compile(r'\bAKIA[0-9A-Z]{16}\b'),                                           # AWS
    re.compile(r'\bAIza[0-9A-Za-z_-]{30,}'),                                       # Google
    re.compile(r'\b\d{6,12}:AA[A-Za-z0-9_-]{30,}'),                                # Telegram bot
    re.compile(r'\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}'), # JWT
    re.compile(r'\bre_[A-Za-z0-9]{20,}'),                                          # Resend
    re.compile(r'\bapify_api_[A-Za-z0-9]{20,}'),                                   # Apify
    re.compile(r'\bpk_(?:live|test)_[A-Za-z0-9]{20,}|\bsk_(?:live|test)_[A-Za-z0-9]{20,}'),  # Stripe
    re.compile(r'(?i)(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://[^\s"\'<>]+'),     # URLs de banco com senha
    re.compile(r'https?://[^\s/:@"\'<>]+:[^\s/@"\'<>]+@[^\s"\'<>]+'),             # https://user:senha@host
    re.compile(r'(?i)basic\s+[A-Za-z0-9+/=]{20,}'),                                # Authorization Basic
    re.compile(r'\b[a-f0-9]{40,}\b'),                                              # hex longo (chaves de portal, tokens)
    re.compile(r'\b[a-z0-9]{4} [a-z0-9]{4} [a-z0-9]{4} [a-z0-9]{4} [a-z0-9]{4} [a-z0-9]{4}\b'),  # senha de aplicativo WP
    re.compile(r'\bqmix_[A-Za-z0-9]{24,}'),                                        # chaves internas QMIX
    re.compile(r'(?i)(?:-pw|--password|--pass|sshpass -p)[ \t]+["\']?[^\s"\']{6,}'),   # senha em linha de comando
    re.compile(r'\bcfat_[A-Za-z0-9]{30,}|\bcfut_[A-Za-z0-9]{30,}'),                     # Cloudflare
    # ULTIMO da lista, de proposito: cadeia longa misturando maiuscula, minuscula e numero (chave generica);
    # so roda em texto/config, porque em codigo pega nome de classe
    re.compile(r'(?<![/.\w-])(?=[A-Za-z0-9_-]{24,}(?![/.\w-]))(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Z])(?=[A-Za-z0-9_-]*[a-z])[A-Za-z0-9_-]{24,}'),
]
BLOCO_PEM = re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----', re.S)
# valores que parecem segredo mas não são
INOCENTE = re.compile(r'(?i)^(true|false|null|none|undefined|[^()]*\([^)]*\)?|process\.env\.[A-Z_]+|\$\{?[A-Z_][A-Z0-9_]*\}?|\$env:[A-Za-z_]+|<[^>]+>|\[[^\]]+\]|x{6,}|\.{3,}|https?://[^\s]*|/[^\s]*|[A-Za-z_./-]+\.(?:txt|json|md|env|pem|key))$')


def limpar_texto(s: str, generico: bool = True, achados=None):
    n = 0
    if achados is None: achados = set()
    def sub_rotulo(m):
        nonlocal n
        valor, sep = m.group(4), m.group(2)
        if INOCENTE.match(valor): return m.group(0)
        # sem ":" ou "=" no meio, só vale se o valor tiver cara de chave (longo, com letra e número)
        if not any(c in sep for c in ':=|'):
            if len(valor) < 16 or not (TEM_DIGITO.search(valor) and TEM_LETRA.search(valor)): return m.group(0)
        elif len(valor) < 20 and not TEM_DIGITO.search(valor): return m.group(0)
        n += 1; achados.add(valor)
        return f'{m.group(1)}{m.group(2)}{m.group(3)}{MARCA}'
    s, k = BLOCO_PEM.subn(MARCA, s); n += k
    s = ROTULO.sub(sub_rotulo, s)
    for p in PADROES[:-1]:
        for m in p.finditer(s): achados.add(m.group(0))
        s, k = p.subn(MARCA, s); n += k
    # o padrão genérico (cadeia longa mista) só em texto/config: em código pega nome de classe
    if generico:
        for m in PADROES[-1].finditer(s): achados.add(m.group(0))
        s, k = PADROES[-1].subn(MARCA, s); n += k
    return s, n


def arquivos_texto(pastas):
    for raiz in pastas:
        for dp, dn, fn in os.walk(raiz):
            for f in fn:
                ext = os.path.splitext(f)[1].lower()
                if ext not in TEXTO and not ext.startswith('.bak') and len(ext) <= 5 and ext not in ('.webp', '.png', '.jpg', '.gif', '.pdf', '.woff', '.ttf', '.ico', '.svg'): continue
                p = os.path.join(dp, f)
                try:
                    if os.path.getsize(p) > 5_000_000: continue
                    raw = open(p, 'rb').read()
                    if bytes([0]) in raw[:4096]: continue
                    yield raiz, p, ext, raw.decode('utf-8')
                except (UnicodeDecodeError, OSError):
                    continue


def main(pastas):
    total, arquivos, achados = 0, [], set()
    # passada 1: rotulos e formatos conhecidos; guarda cada valor apagado
    for raiz, p, ext, s in arquivos_texto(pastas):
        novo, n = limpar_texto(s, generico=(ext in GENERICO_EM or ext not in TEXTO), achados=achados)
        if n:
            io.open(p, 'w', encoding='utf-8', newline='').write(novo)
            total += n; arquivos.append((n, os.path.relpath(p, raiz)))
    # passada 2: a mesma senha costuma aparecer em tabela, README e comando sem rotulo nenhum
    valores = sorted({v for v in achados if len(v) >= 8 and not INOCENTE.match(v)}, key=len, reverse=True)
    if valores:
        rx = re.compile('|'.join(re.escape(v) for v in valores))
        extra = 0
        for raiz, p, ext, s in arquivos_texto(pastas):
            novo, k = rx.subn(MARCA, s)
            if k:
                io.open(p, 'w', encoding='utf-8', newline='').write(novo)
                extra += k; arquivos.append((k, os.path.relpath(p, raiz) + ' (2a passada)'))
        total += extra
    arquivos.sort(reverse=True)
    print(f'limpeza: {total} credenciais removidas em {len(arquivos)} arquivos ({len(valores)} valores distintos)')
    for n, p in arquivos[:40]: print(f'  {n:4d}  {p}')
    if len(arquivos) > 40: print(f'  ... e mais {len(arquivos) - 40} arquivos')


if __name__ == '__main__':
    main(sys.argv[1:])
