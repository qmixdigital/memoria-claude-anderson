"""Prompts. Separados do codigo para poderem ser ajustados sem mexer na logica.

Sobre o cache: o bloco REGRAS e identico em toda chamada e vai PRIMEIRO, com
cache_control. O perfil de voz do portal vem DEPOIS e nao e cacheado.

O motivo e pratico. Cache do Anthropic e casamento de prefixo com TTL de 5
minutos. Com 3 materias por semana por portal, o perfil de um portal so
reapareceria dias depois: nunca daria hit. Ja o bloco de regras aparece nas ~65
chamadas do lote diario, entao acerta o cache da segunda em diante. Inverter a
ordem jogaria fora a unica economia real de cache que este desenho permite.
"""

# Bloco estavel, compartilhado por todas as chamadas. Precisa passar de ~1024
# tokens para ser cacheavel, e passa.
REGRAS = """Voce e redator de um portal de noticias brasileiro. Recebe de duas a
quatro reportagens de veiculos diferentes sobre o MESMO fato e escreve uma
materia ORIGINAL que sintetiza o que se sabe, com a voz editorial do portal de
destino.

REGRA ABSOLUTA DE ORIGINALIDADE
Voce NUNCA reproduz trecho das fontes. Nem frase, nem meia frase, nem parafrase
colada. Voce le, entende o fato e escreve do zero, com estrutura e vocabulario
proprios. Se uma formulacao das fontes for a unica forma natural de dizer algo
(nome de cargo, nome oficial de programa, termo tecnico), ela pode aparecer, mas
qualquer sequencia de mais de seis palavras identica a uma fonte e proibida.
Citacao literal de declaracao so entre aspas, curta, e sempre com atribuicao
explicita a quem falou e ao veiculo que registrou.

ATRIBUICAO E LINKS
Toda informacao factual relevante e atribuida. Voce cita os veiculos de origem
pelo nome no corpo do texto e cria um link para a materia original em pelo menos
duas mencoes, com texto ancora descritivo, nunca "clique aqui" ou "saiba mais".
Ao fim do texto, uma secao com o titulo "Fontes" lista os veiculos consultados,
cada um com link.

LINGUA E ESTILO
Portugues brasileiro, com acentuacao correta e sempre completa. Nomes proprios,
cidades e instituicoes com os acentos certos.
E PROIBIDO usar travessao (o caractere longo) em qualquer lugar do texto: nem no
titulo, nem no corpo, nem na meta description, nem nos intertitulos. Onde a
tentacao aparecer, use virgula, dois pontos, parenteses ou reescreva a frase.
Travessao denuncia texto de maquina e nao entra.
Nao use as palavras "crucial", "fundamental", "vale ressaltar", "e importante
destacar", "cenario", "panorama" nem "em suma". Nao abra a materia com uma
pergunta retorica. Nao encerre com uma frase de efeito generica sobre o futuro.

FATOS
Voce so escreve o que esta nas fontes. Nao completa lacuna com conhecimento
proprio, nao estima numero, nao infere causa que as fontes nao afirmam. Se as
fontes divergem sobre um dado, o texto diz que divergem e apresenta as duas
versoes com atribuicao. Se um dado essencial falta, o texto diz que a informacao
nao foi divulgada. Datas relativas das fontes ("ontem", "na ultima terca") sao
convertidas para data absoluta.

ESTRUTURA
Primeiro paragrafo responde o que aconteceu, com quem, onde e quando, em ate 55
palavras, e funciona sozinho como resposta de destaque em busca.
Depois, o desenvolvimento em paragrafos curtos, de duas a quatro frases.
Intertitulos em h2 a cada tres ou quatro paragrafos, descritivos, contendo
termos que o leitor de fato pesquisaria.
O corpo sai em HTML simples: apenas <p>, <h2>, <h3>, <ul>, <li>, <strong>,
<em>, <blockquote> e <a href>. Sem <div>, sem classe, sem estilo, sem <img>,
sem <h1>: o titulo vai a parte.

TITULO E METADADOS
O titulo tem no maximo 60 caracteres, com a palavra-chave do fato no comeco, e e
diferente de todos os titulos das fontes.
A meta description tem entre 140 e 158 caracteres, contem a palavra-chave e da
o fato, sem prometer o que o texto nao entrega.
O sutia (dek) tem uma frase, de 15 a 30 palavras, e complementa o titulo em vez
de repeti-lo.

SAIDA
Responda EXATAMENTE neste formato de blocos, nada antes e nada depois. Cada
marcador em uma linha propria, sem cerca de crase, sem JSON, sem comentario:

===TITULO===
o titulo aqui
===DEK===
o sutia aqui
===META_TITLE===
o title da pagina aqui
===META_DESCRIPTION===
a meta description aqui
===CATEGORIA===
a categoria copiada literalmente da lista permitida
===PALAVRA_CHAVE===
a palavra-chave principal
===PROMPT_IMAGEM===
a descricao da imagem em ingles
===CORPO===
o HTML da materia aqui, podendo ocupar varias linhas e usar aspas a vontade
===FIM===

Use aspas normais dentro do texto sem se preocupar com escape: neste formato
nada precisa ser escapado. O bloco CORPO vai por ultimo e vai inteiro.
O campo "categoria" tem que ser copiado LITERALMENTE de uma das categorias
permitidas que serao informadas. Nao invente categoria nova, nao traduza, nao
ajuste maiuscula: categoria fora da lista quebra o menu do portal.
O campo "prompt_imagem" e uma descricao em INGLES da imagem de capa, concreta e
fotografica, sem nenhum texto ou letra na cena, sem rosto de pessoa real
identificavel e sem logotipo de marca.
"""

ESQUEMA_MATERIA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["titulo", "dek", "meta_title", "meta_description",
                 "corpo_html", "categoria", "prompt_imagem", "palavra_chave"],
    "properties": {
        "titulo": {"type": "string", "maxLength": 70},
        "dek": {"type": "string"},
        "meta_title": {"type": "string", "maxLength": 70},
        "meta_description": {"type": "string", "maxLength": 170},
        "corpo_html": {"type": "string"},
        "categoria": {"type": "string"},
        "prompt_imagem": {"type": "string"},
        "palavra_chave": {"type": "string"},
    },
}


CAMPOS = ("titulo", "dek", "meta_title", "meta_description", "categoria",
          "palavra_chave", "prompt_imagem", "corpo")


def parse_blocos(texto):
    """Le a saida em blocos ===CAMPO=== e devolve o dicionario da materia.

    Substituiu o JSON depois de TRES modos de falha medidos em 20/08/2026,
    todos com o mesmo texto de origem:

      1. com output_config/json_schema, o modelo encerrava a materia no meio
         da frase (stop_reason=end_turn, corpo cortado);
      2. sem schema, o modelo punha quebra de linha literal dentro da string
         e o json.loads recusava com "Invalid control character";
      3. e punha aspas NAO escapadas em volta do nome das obras citadas, o
         que quebra o JSON de um jeito que nem strict=False resolve.

    Materia longa em HTML e cheia de aspas e quebra de linha. JSON exige que
    as duas coisas sejam escapadas, e o modelo nao escapa de forma confiavel
    em texto longo. Delimitador em linha propria nao tem esse problema: nada
    dentro do bloco precisa de escape.
    """
    if not texto:
        raise ValueError("resposta vazia")
    dados, atual, buffer = {}, None, []
    for linha in texto.replace("\r\n", "\n").split("\n"):
        marca = linha.strip()
        if marca.startswith("===") and marca.endswith("===") and len(marca) > 6:
            if atual:
                dados[atual] = "\n".join(buffer).strip()
            nome = marca.strip("=").strip().lower()
            if nome == "fim":
                atual, buffer = None, []
                break
            atual, buffer = nome, []
            continue
        if atual:
            buffer.append(linha)
    if atual:
        dados[atual] = "\n".join(buffer).strip()

    dados["corpo_html"] = dados.pop("corpo", "")
    faltando = [c for c in CAMPOS if c != "corpo"
                and not dados.get(c)] + ([] if dados["corpo_html"]
                                         else ["corpo"])
    if faltando:
        raise ValueError("blocos ausentes na resposta: " + ", ".join(faltando))
    return dados


def _instrucao_tamanho(valor):
    """Traduz `tamanho_palavras` em instrucao de tamanho.

    Aceita numero (alvo fixo) ou lista de dois numeros (faixa adaptativa).
    No modo adaptativo o texto NAO mira um numero: o comprimento sai da
    substancia das fontes. O ponto e nao pagar token para encher linguica
    em pauta magra, sem cortar pauta que merece folego.
    """
    if isinstance(valor, (list, tuple)) and len(valor) == 2:
        partes = [
            'Tamanho: NAO mire um numero de palavras. Deixe o texto ter o '
            'comprimento que a substancia das fontes sustenta, entre '
            '{} e {} palavras.'.format(valor[0], valor[1]),
            '  Pauta com muitos dados verificaveis, varias vozes e '
            'desdobramento merece folego e vai para o teto da faixa.',
            '  Pauta de fato simples, com pouca informacao confirmada, sai '
            'enxuta e para no piso da faixa. Texto curto bem apurado e '
            'melhor que texto longo repetido.',
            '  E PROIBIDO alongar com repeticao do que ja foi dito, contexto '
            'generico que nao veio das fontes, frase de efeito ou parafrase '
            'do proprio texto so para atingir tamanho.',
        ]
        return chr(10).join(partes)
    return 'Tamanho alvo: {} palavras'.format(valor)

def perfil_do_site(site):
    """Bloco de voz do portal. Vem depois das regras, sem cache."""
    p = site.get("perfil_redacao", {})
    linhas = [
        "PORTAL DE DESTINO: {}".format(site.get("nome", site["slug"])),
        "URL: {}".format(site.get("base_url", "")),
        "",
        "VOZ DESTE PORTAL, que difere da de qualquer outro:",
        p.get("voz", "Jornalismo factual, direto e sobrio."),
        "",
        "Pessoa gramatical: {}".format(p.get("pessoa", "terceira pessoa")),
        _instrucao_tamanho(p.get("tamanho_palavras", 700)),
        "Estrutura preferida: {}".format(
            p.get("estrutura", "lide, contexto, desdobramento, o que vem a seguir")),
        "Registro: {}".format(p.get("registro", "formal acessivel")),
    ]
    if p.get("evitar"):
        linhas.append("Evitar neste portal: " + "; ".join(p["evitar"]))
    if p.get("assinatura_nome"):
        linhas.append("Assinatura: {}".format(p["assinatura_nome"]))
    linhas += [
        "",
        "CATEGORIAS PERMITIDAS (copie uma LITERALMENTE no campo categoria):",
        "  " + " | ".join(site.get("categorias_validas", ["Notícias"])),
    ]
    return "\n".join(linhas)


def mensagem_fontes(fato_titulo, fontes):
    """Monta o turno do usuario com as reportagens de origem."""
    partes = ["FATO A COBRIR: {}".format(fato_titulo), "",
              "REPORTAGENS DE ORIGEM ({} veiculos):".format(len(fontes)), ""]
    for i, f in enumerate(fontes, 1):
        veiculo = f.get("veiculo") or f.get("dominio")
        data = f["publicado_em"].strftime("%d/%m/%Y") if f.get("publicado_em") else "data nao informada"
        partes += [
            "--- FONTE {} ---".format(i),
            "Veiculo: {}".format(veiculo),
            "URL: {}".format(f.get("url_final")),
            "Publicado em: {}".format(data),
            "Titulo original: {}".format(f.get("titulo")),
            "",
            (f.get("texto") or "")[:9000],
            "",
        ]
    partes.append(
        "Escreva a materia original agora, seguindo as regras e a voz do "
        "portal. Responda apenas com o JSON.")
    return "\n".join(partes)
