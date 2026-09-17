"""Dedupe por fato: agrupa materias de veiculos diferentes sobre o mesmo assunto.

Desenho hibrido, em tres passos, para nao pagar embedding em tudo:

  1. PENEIRA BARATA  SimHash do titulo normalizado + janela de 48 h + idioma.
     Forma baldes de candidatos com custo zero. Corta ~95% das comparacoes.
  2. CONFIRMACAO     embedding (API) do titulo + primeiro paragrafo, cosseno
     >= 0,82 contra o centroide do fato. So roda dentro do balde.
  3. ARBITRO         em caso de duvida (cosseno na faixa cinza), um modelo
     barato decide se e o mesmo fato. Ultimo recurso, poucos casos.

O GUID do fato e um UUID atribuido na CRIACAO do cluster, nunca derivado das
URLs: se fosse derivado, mudaria toda vez que uma fonte nova entrasse, e o
registro de "ja publiquei este fato aqui" perderia a referencia.

Um fato so vira pauta com no minimo 2 dominios distintos.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import logging
import re
import unicodedata

from . import config, db
from .providers import embeddings

log = logging.getLogger("motor.dedupe")

# Faixa cinza do cosseno, CALIBRADA em 20/08/2026 com 79 fontes reais
# (45 pares do mesmo fato, 412 pares de fatos diferentes):
#
#   mesmo fato        min=0,5603  p50=0,8053  p90=0,8790  max=0,9187
#   fatos diferentes  min=0,1400  p50=0,2742  p90=0,5321  p99=0,7009  max=0,8006
#
# As duas distribuicoes SE SOBREPOEM entre 0,56 e 0,80, entao nenhum limiar
# unico separa. O desenho e:
#
#   >= limiar (0,82)   junta direto. 0,82 fica logo acima do MAIOR cosseno
#                      observado entre fatos diferentes (0,8006).
#   0,72 a 0,82        faixa cinza: o arbitro Haiku decide.
#   < 0,72             recusa.
#
# O piso de 0,72 foi TESTADO contra 0,62 nos mesmos dados. A distribuicao
# sugeria que baixar para 0,62 recuperaria pares legitimos do generico de
# semaglutida (0,6714, 0,7136, 0,7267). O contrafactual mostrou que nao:
#
#   piso 0,72  ->  6 fatos prontos, cluster de semaglutida com 4 dominios,
#                  37 chamadas ao arbitro, 2 confirmacoes
#   piso 0,62  ->  6 fatos prontos, cluster de semaglutida com 4 dominios,
#                  52 chamadas ao arbitro, 2 confirmacoes
#
# Resultado identico com 40% mais chamadas pagas. A razao e que o agrupamento
# usa o CENTROIDE do fato, e nao pares soltos: conforme fontes entram, o
# centroide se desloca e puxa as demais acima de 0,82 sozinho. A faixa extra so
# expoe pares que o arbitro depois recusa. Nao baixar sem novo contrafactual.
FAIXA_CINZA = (0.72, 0.82)

# Peneira barata. NAO usa distancia de SimHash: medido em titulos reais, a
# mesma noticia em dois veiculos deu 27 bits de distancia e duas noticias sem
# relacao deram 31, contra uma media aleatoria de 32. Ou seja, quase nenhum
# sinal. A razao e que veiculos diferentes descrevem o mesmo fato com palavras
# diferentes ("Banco Central reduz a Selic" x "Copom corta taxa basica"), que e
# exatamente o caso que a peneira precisa deixar passar.
#
# O que discrimina bem em noticia e a sobreposicao de fichas RARAS: nome
# proprio, sigla e numero. As duas manchetes acima compartilham {selic, taxa,
# 975}; uma manchete sobre alagamento nao compartilha nenhuma.
MIN_FICHAS_COMUNS = 2
MIN_JACCARD = 0.12
# SimHash continua sendo gravado, mas para outra coisa: pegar o mesmo texto
# sindicalizado quase identico em varios sites (distancia bem baixa).
DIST_SINDICALIZADO = 6

PARADAS = {
    "a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "em", "no",
    "na", "nos", "nas", "um", "uma", "para", "por", "com", "que", "ao", "aos",
    "se", "sobre", "apos", "ate", "the", "of", "to", "in", "and",
}

# Fichas de alta frequencia em noticiario. Continuam entrando no Jaccard, mas
# NAO contam para o minimo de fichas comuns: sozinhas nao indicam mesmo fato.
FRACAS = {
    "anuncia", "anuncio", "anunciou", "anunciam", "diz", "disse", "afirma",
    "afirmou", "revela", "revelou", "confirma", "confirmou", "informa",
    "informou", "aponta", "apontou", "novo", "nova", "novos", "novas",
    "governo", "federal", "ministro", "ministra", "presidente", "pais",
    "brasil", "brasileiro", "brasileira", "empresa", "milhoes", "bilhoes",
    "mil", "hoje", "ontem", "segundo", "durante", "contra", "entre", "pode",
    "deve", "vai", "ter", "ser", "estao", "sera", "foi", "foram", "apos",
    "primeira", "primeiro", "maior", "melhor", "veja", "saiba", "entenda",
}


def normalizar(texto):
    t = unicodedata.normalize("NFKD", (texto or "").lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return [p for p in t.split() if p and p not in PARADAS and len(p) > 2]


def simhash(texto, bits=64):
    """SimHash sobre bigramas do titulo normalizado."""
    palavras = normalizar(texto)
    if not palavras:
        return 0
    fichas = palavras + ["{}_{}".format(a, b)
                         for a, b in zip(palavras, palavras[1:])]
    vetor = [0] * bits
    for f in fichas:
        h = int(hashlib.md5(f.encode("utf-8")).hexdigest(), 16)
        for i in range(bits):
            vetor[i] += 1 if (h >> i) & 1 else -1
    val = 0
    for i in range(bits):
        if vetor[i] > 0:
            val |= (1 << i)
    # BIGINT do Postgres e com sinal: mapeia para a faixa assinada
    return val - (1 << 64) if val >= (1 << 63) else val


def distancia(a, b):
    return bin((a ^ b) & ((1 << 64) - 1)).count("1")


def fichas(texto):
    """Fichas discriminantes de um titulo: tokens de conteudo mais numeros.

    Numeros ficam com a pontuacao removida para que "9,75%" e "9.75%" caiam na
    mesma ficha, que e o que costuma amarrar duas manchetes sobre o mesmo dado.
    """
    palavras = set(normalizar(texto))
    numeros = {re.sub(r"[^0-9]", "", n)
               for n in re.findall(r"\d[\d.,]*", texto or "")}
    return palavras | {n for n in numeros if n}


def candidato_barato(fa, fb):
    """Peneira de custo zero. Devolve (passa, jaccard).

    So conta como sobreposicao a ficha que discrimina. Duas manchetes podem
    compartilhar "anuncia" e "reajuste" sem terem nada a ver uma com a outra
    ("Petrobras anuncia reajuste da gasolina" e "Governo anuncia reajuste do
    salario minimo"), entao palavra de noticiario de alta frequencia nao conta
    para o minimo de fichas comuns.
    """
    if not fa or not fb:
        return False, 0.0
    comuns = fa & fb
    uniao = fa | fb
    jac = len(comuns) / len(uniao) if uniao else 0.0
    fortes = comuns - FRACAS
    return (len(fortes) >= MIN_FICHAS_COMUNS and jac >= MIN_JACCARD), jac


def _texto_para_embedding(titulo, texto):
    primeiro = (texto or "").strip().split("\n\n")[0][:600]
    return "{}\n\n{}".format(titulo or "", primeiro).strip()


CHAVE_ARBITRO = "metricas_arbitro"


def metricas_arbitro():
    """Quantas vezes o arbitro Haiku foi chamado e quanto ele confirmou.

    Medido em 20/08/2026 sobre 79 fontes reais: 37 chamadas, 2 confirmacoes,
    taxa de 5,4%. Ou seja, o arbitro NAO esta referendando a peneira, esta
    filtrando de verdade, e a hipotese de que ele so carimba nao se sustentou.

    Por isso a leitura tem dois lados:

      acima de 90%  o arbitro so confirma o que a peneira ja decidiu: da para
                    subir MIN_JACCARD ou baixar FAIXA_CINZA[0] e deixar a
                    peneira decidir sozinha em mais casos.
      abaixo de 10%  a faixa cinza esta larga demais e quase toda chamada e
                    gasto para dizer "nao". Da para SUBIR FAIXA_CINZA[0].

    Custo real medido: US$ 0,00045 por chamada, 0,47 chamada por fonte
    coletada. Em 15.000 fontes/mes da ~US$ 3,17, e nao os US$ 17,83 que a
    estimativa inicial supunha (ela assumia uma chamada por fonte).
    """
    m = db.estado_get(CHAVE_ARBITRO, {}) or {}
    chamadas = int(m.get("chamadas", 0))
    confirmou = int(m.get("confirmou", 0))
    return {
        "chamadas": chamadas,
        "confirmou": confirmou,
        "recusou": chamadas - confirmou,
        "taxa_confirmacao": (round(confirmou / chamadas * 100, 1)
                             if chamadas else None),
        "alvo_otimizacao": ("peneira pode decidir sozinha em mais casos"
                            if chamadas >= 50 and confirmou / max(chamadas, 1) > 0.90
                            else "medir mais antes de mexer"),
    }


def _registrar_arbitro(confirmou):
    m = db.estado_get(CHAVE_ARBITRO, {}) or {}
    m["chamadas"] = int(m.get("chamadas", 0)) + 1
    m["confirmou"] = int(m.get("confirmou", 0)) + (1 if confirmou else 0)
    db.estado_set(CHAVE_ARBITRO, m)


def _arbitrar(titulo_a, titulo_b):
    """Desempate barato quando o cosseno fica na faixa cinza."""
    from . import budget
    from .providers import anthropic_p as ap
    sistema = (
        "Voce compara duas manchetes e responde se relatam o MESMO fato "
        "concreto (mesmo acontecimento, mesmos protagonistas, mesma ocasiao) "
        "ou fatos diferentes. Dois textos sobre o mesmo tema geral mas eventos "
        "distintos sao fatos DIFERENTES. Responda apenas com JSON: "
        '{"mesmo_fato": true|false}'
    )
    try:
        msg = ap.chamar(
            config.modelo_mecanico(),
            ap.bloco_system(sistema, cachear=False),
            [{"role": "user", "content": "A: {}\nB: {}".format(titulo_a,
                                                               titulo_b)}],
            max_tokens=64)
        u = ap.uso(msg)
        budget.registrar("mecanico", provedor="anthropic",
                         modelo=config.modelo_mecanico(),
                         tokens_in=u["in"], tokens_out=u["out"],
                         cache_read=u["cache_read"],
                         cache_write=u["cache_write"])
        decisao = bool(ap.json_de(msg).get("mesmo_fato"))
        _registrar_arbitro(decisao)
        return decisao
    except Exception as e:
        log.warning("arbitro falhou, tratando como fatos diferentes: %s", e)
        return False


def _centroide(fato_id):
    linhas = db.q(
        "SELECT embedding FROM artigos_fonte "
        "WHERE fato_id=%s AND embedding IS NOT NULL", (fato_id,)) or []
    vetores = [l["embedding"] for l in linhas if l["embedding"]]
    if not vetores:
        return None
    n = len(vetores[0])
    return [sum(v[i] for v in vetores) / len(vetores) for i in range(n)]


def _atualizar_contagem(fato_id):
    r = db.q(
        "SELECT COUNT(*) AS n, COUNT(DISTINCT dominio) AS d "
        "FROM artigos_fonte WHERE fato_id=%s", (fato_id,), um=True)
    pronto = (r["d"] or 0) >= config.min_dominios()
    db.exec1(
        "UPDATE fatos SET n_fontes=%s, n_dominios=%s, pronto=%s, "
        "atualizado_em=now() WHERE id=%s",
        (r["n"], r["d"], pronto, fato_id))
    return pronto


def agrupar(limite=200):
    """Agrupa as fontes extraidas em fatos. Devolve (novos_fatos, anexadas)."""
    linhas = db.q(
        "SELECT id, titulo, texto, dominio, publicado_em, idioma "
        "FROM artigos_fonte WHERE estado='extraido' AND fato_id IS NULL "
        "ORDER BY coletado_em ASC LIMIT %s", (limite,)) or []
    if not linhas:
        return 0, 0

    # embeddings em uma unica chamada, em lote
    textos = [_texto_para_embedding(l["titulo"], l["texto"]) for l in linhas]
    try:
        vetores = embeddings.embutir(textos)
    except Exception as e:
        log.error("embeddings falharam, agrupando so por simhash: %s", e)
        vetores = [None] * len(linhas)

    janela = dt.timedelta(hours=config.janela_fato_h())
    limiar = config.limiar_cosseno()
    novos = anexadas = 0

    for linha, vetor in zip(linhas, vetores):
        sh = simhash(linha["titulo"])
        db.exec1("UPDATE artigos_fonte SET simhash=%s, embedding=%s WHERE id=%s",
                 (sh, vetor, linha["id"]))

        # candidatos: fatos abertos dentro da janela
        cands = db.q(
            "SELECT f.id, f.titulo_representativo FROM fatos f "
            "WHERE f.encerrado = false AND f.criado_em > now() - %s "
            "ORDER BY f.atualizado_em DESC LIMIT 400", (janela,)) or []

        fa = fichas(linha["titulo"])
        alvo = None
        for c in cands:
            # 1. peneira de custo zero: sobreposicao de fichas raras
            perto, jac = candidato_barato(
                fa, fichas(c["titulo_representativo"]))
            # texto sindicalizado quase identico: entra direto
            if distancia(sh, simhash(c["titulo_representativo"])) <= DIST_SINDICALIZADO:
                alvo = c
                break
            if not perto:
                continue

            # 2. confirmacao por embedding, so dentro do balde
            score = 0.0
            if vetor:
                cen = _centroide(c["id"])
                score = embeddings.cosseno(vetor, cen) if cen else 0.0
            if score >= limiar:
                alvo = c
                break
            # 3. arbitro barato so na faixa cinza
            if FAIXA_CINZA[0] <= score < FAIXA_CINZA[1]:
                if _arbitrar(linha["titulo"], c["titulo_representativo"]):
                    alvo = c
                    break
            if not vetor and jac >= 0.30:
                # sem embedding disponivel, so agrupa com sobreposicao forte
                alvo = c
                break

        if alvo is None:
            r = db.inserir_devolvendo(
                "INSERT INTO fatos (titulo_representativo) VALUES (%s) "
                "RETURNING id", (linha["titulo"],))
            fato_id = r["id"]
            novos += 1
        else:
            fato_id = alvo["id"]
            anexadas += 1

        db.exec1("UPDATE artigos_fonte SET fato_id=%s, estado='agrupado' "
                 "WHERE id=%s", (fato_id, linha["id"]))
        _atualizar_contagem(fato_id)

    log.info("agrupamento: %d fatos novos, %d fontes anexadas", novos, anexadas)
    return novos, anexadas


def fatos_prontos(limite=100):
    """Fatos com o minimo de dominios distintos, ainda nao encerrados."""
    return db.q(
        "SELECT f.id, f.guid, f.titulo_representativo, f.n_fontes, "
        "f.n_dominios, f.criado_em FROM fatos f "
        "WHERE f.pronto AND NOT f.encerrado "
        "ORDER BY f.n_dominios DESC, f.criado_em DESC LIMIT %s",
        (limite,)) or []


def fontes_do_fato(fato_id, maximo=4):
    """As melhores fontes de um fato: um artigo por dominio, o mais longo."""
    return db.q(
        "SELECT DISTINCT ON (dominio) id, titulo, texto, url_final, dominio, "
        "veiculo, publicado_em, n_palavras FROM artigos_fonte "
        "WHERE fato_id=%s AND texto IS NOT NULL "
        "ORDER BY dominio, n_palavras DESC NULLS LAST LIMIT %s",
        (fato_id, maximo)) or []
