"""Otimizador PageSpeed para os sites estaticos da rede (HTML + style.css + js/main.js + imagens/).
Uso: python static_site_fix.py <pasta-do-site> <porta-livre> [--mobile-full]
1. Imagens: variantes 480/800 + srcset/sizes nas fotos >= 600px; logos com variantes 2x; icones reduzidos a 128px; preload do hero com imagesrcset.
2. Banner de cookies: aparece imediato (sem setTimeout de 600ms), para nao virar elemento LCP atrasado.
3. CSS critico inline por pagina (cobertura Playwright em 390 e 1280) + style.css carregado assincrono (media=print -> all) com noscript.
"""
import os, re, sys, glob, subprocess, time, json
from PIL import Image

SITE = os.path.abspath(sys.argv[1]); PORT = int(sys.argv[2]); MOBILE_FULL = "--mobile-full" in sys.argv
os.chdir(SITE)
IMG_DIR = "imagens"

# ---------------------------------------------------------------- 1. imagens
def variants_for(path, real_w, kind):
    base, ext = os.path.splitext(path)
    widths = [480, 800] if kind == "photo" else [320, 480]
    out = []
    for w in widths:
        if w < real_w:
            vp = f"{base}-{w}{ext}"
            if not os.path.exists(vp):
                im = Image.open(path); r = w / im.width
                alpha = im.mode in ("RGBA", "LA", "P") and ("transparency" in im.info or im.mode != "P")
                im = im.convert("RGBA" if alpha else "RGB").resize((w, round(im.height * r)), Image.LANCZOS)
                im.save(vp, "WEBP", quality=80 if not alpha else 88, method=6)
            out.append((vp, w))
    out.append((path, real_w))
    return out

def sizes_for(kind, hero):
    if kind == "logo": return "(max-width: 899px) 170px, 230px"
    if hero: return "(max-width: 899px) 100vw, 50vw"
    return "(max-width: 899px) calc(100vw - 32px), 600px"

img_re = re.compile(r'<img\b[^>]*>')
srcset_cache = {}
touched_imgs = 0
for f in glob.glob("*.html"):
    s = open(f, encoding="utf-8").read(); orig = s
    def fix_img(m):
        global touched_imgs
        t = m.group(0)
        if "srcset=" in t: return t
        src = re.search(r'src="(/imagens/[^"]+\.webp)"', t)
        if not src: return t
        rel = src.group(1).lstrip("/")
        if not os.path.exists(rel): return t
        name = os.path.basename(rel)
        if name.startswith("og-"): return t
        im = Image.open(rel); rw, rh = im.size
        if "icone" in name:
            if max(rw, rh) > 128:
                r = 128 / max(rw, rh); im.convert("RGBA").resize((max(1, round(rw * r)), max(1, round(rh * r))), Image.LANCZOS).save(rel, "WEBP", quality=88, method=6)
            return t
        kind = "logo" if "logo" in name else "photo"
        if kind == "photo" and rw < 600: return t
        if kind == "logo" and rw < 400: return t
        hero = 'fetchpriority="high"' in t
        vs = variants_for(rel, rw, kind)
        srcset = ", ".join(f"/{p.replace(os.sep, '/')} {w}w" for p, w in vs)
        sizes = sizes_for(kind, hero)
        srcset_cache[src.group(1)] = (srcset, sizes)
        touched_imgs += 1
        return t[:-1] + f' srcset="{srcset}" sizes="{sizes}">'
    s = img_re.sub(fix_img, s)
    # preload do hero acompanha o srcset
    def fix_preload(m):
        t = m.group(0); href = re.search(r'href="([^"]+)"', t)
        if href and href.group(1) in srcset_cache and "imagesrcset" not in t:
            ss, sz = srcset_cache[href.group(1)]
            return t[:-1] + f' imagesrcset="{ss}" imagesizes="{sz}">'
        return t
    s = re.sub(r'<link rel="preload" as="image"[^>]*>', fix_preload, s)
    if s != orig: open(f, "w", encoding="utf-8").write(s)
print("imagens: tags com srcset:", touched_imgs)

# ---------------------------------------------------------------- 2. banner imediato
js = "js/main.js"
if os.path.exists(js):
    j = open(js, encoding="utf-8").read()
    j2 = j.replace("setTimeout(function () { banner.classList.add('show'); }, 600);", "banner.classList.add('show');")
    if j2 != j: open(js, "w", encoding="utf-8").write(j2); print("banner: imediato")
    else: print("banner: ja imediato ou padrao diferente")

# ---------------------------------------------------------------- 3. CSS critico
css_path = "style.css"; css = open(css_path, encoding="utf-8", newline="").read()  # preserva CRLF: offsets do CDP sao do arquivo servido

def split_blocks(text, start=0, end=None):
    """Divide em blocos de topo: (inicio, fim, cabecalho, corpo_inicio, corpo_fim)."""
    end = len(text) if end is None else end
    i = start; blocks = []
    while i < end:
        j = text.find("{", i)
        if j == -1 or j >= end: break
        head = text[i:j]
        depth = 1; k = j + 1
        while k < end and depth:
            if text[k] == "{": depth += 1
            elif text[k] == "}": depth -= 1
            k += 1
        blocks.append((i, k, head.strip(), j + 1, k - 1))
        i = k
    return blocks

def strip_comments(t): return re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group(0)), t, flags=re.S)
css_nc = strip_comments(css)

server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
from playwright.sync_api import sync_playwright
used_by_page = {}
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for f in sorted(glob.glob("*.html")):
            ranges = []
            for w, h in [(390, 844), (1280, 900)]:
                pg = b.new_page(viewport={"width": w, "height": h})
                cdp = pg.context.new_cdp_session(pg)
                sheets = {}
                cdp.on("CSS.styleSheetAdded", lambda ev: sheets.__setitem__(ev["header"]["styleSheetId"], ev["header"].get("sourceURL", "")))
                cdp.send("DOM.enable"); cdp.send("CSS.enable"); cdp.send("CSS.startRuleUsageTracking")
                pg.goto(f"http://127.0.0.1:{PORT}/{f}?cc=1", wait_until="load"); pg.wait_for_timeout(700)
                usage = cdp.send("CSS.stopRuleUsageTracking")["ruleUsage"]
                cand = []
                for u in usage:
                    if u.get("used") and "style.css" in sheets.get(u["styleSheetId"], ""):
                        cand.append((int(u["startOffset"]), int(u["endOffset"])))
                # so o que esta na primeira tela: testa os seletores da regra contra a posicao dos elementos
                sels = []
                for (s0, e0) in cand:
                    head = css_nc[:s0].rsplit("}", 1)[-1].rsplit("{", 1)[-1] if False else None
                    # cabecalho = texto entre o fechamento anterior e o "{" desta regra
                    k = css_nc.rfind("{", 0, e0)  # inicio do corpo desta regra
                    j = max(css_nc.rfind("}", 0, k), css_nc.rfind("{", 0, k))
                    sels.append(css_nc[j + 1:k].strip())
                fold = pg.evaluate("""(sels) => sels.map(sel => {
                    const clean = sel.replace(/::?[a-zA-Z-]+(\\([^)]*\\))?/g, m => (m.startsWith('::') || /^:(hover|focus|active|focus-visible|focus-within|visited)/.test(m)) ? '' : m).trim();
                    if (!clean || clean.startsWith('@')) return true;
                    let els; try { els = document.querySelectorAll(clean); } catch (e) { return true; }
                    if (!els.length) return sel !== clean;  /* regra so de estado (hover/focus): guarda */
                    const vh = innerHeight + 200;
                    for (const el of els) { const r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > -200) return true; }
                    return false;
                })""", sels)
                # --mobile-full: no celular (390) entra tudo o que a pagina usa, nao so a primeira tela.
                # Evita a "transformacao" visivel no iPhone em rede movel, quando o style.css chega
                # depois e re-estiliza o que estava abaixo da dobra (medido 21/09/2026: LCP igual).
                if MOBILE_FULL and w < 600: fold = [True] * len(cand)
                for (rng, ok) in zip(cand, fold):
                    if ok: ranges.append(rng)
                pg.close()
            used_by_page[f] = ranges
        b.close()
finally:
    server.terminate()

def covered(a, b_, ranges):
    return any(s < b_ and e > a for s, e in ranges)

always = ("@font-face", ":root", "@keyframes", "prefers-reduced-motion", "*,*::before", ":where(", ".skip", ":focus-visible")
def build_critical(ranges):
    out = []
    for (s, e, head, bs, be) in split_blocks(css_nc):
        if head.startswith("@media"):
            inner = [css[i0:i1] for (i0, i1, h2, _, _) in split_blocks(css_nc, bs, be) if covered(i0, i1, ranges) or any(k in h2 for k in always)]
            if inner: out.append(head + "{" + "".join(inner) + "}")
        else:
            if covered(s, e, ranges) or any(k in head for k in always): out.append(css[s:e])
    return "".join(out)

link_re = re.compile(r'<link rel="stylesheet" href="(/style\.css[^"]*)">')
done = 0
for f, ranges in used_by_page.items():
    s = open(f, encoding="utf-8").read()
    # reexecutavel: desfaz um bloco critico anterior e volta ao link simples
    s = re.sub(r'<style data-critical>.*?</style>\n<link rel="preload" href="(/style\.css[^"]*)" as="style"[^>]*>\n<noscript><link rel="stylesheet" href="[^"]*"></noscript>',
               lambda mm: f'<link rel="stylesheet" href="{mm.group(1)}">', s, flags=re.S)
    m = link_re.search(s)
    if not m: print("sem link de css:", f); continue
    href = m.group(1); crit = build_critical(ranges)
    crit = re.sub(r"\s*\n\s*", "", crit)
    new = (f'<style data-critical>{crit}</style>\n'
           f'<link rel="preload" href="{href}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
           f'<noscript><link rel="stylesheet" href="{href}"></noscript>')
    s = s.replace(m.group(0), new, 1)
    open(f, "w", encoding="utf-8").write(s); done += 1
    print(f"{f}: critico {len(crit.encode())//1024} KB")
print("paginas com css critico:", done)
