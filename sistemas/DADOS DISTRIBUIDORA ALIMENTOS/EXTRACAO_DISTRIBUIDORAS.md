# Extração de Dados - Distribuidoras de Alimentos
## Receita Federal → CSV/JSON para importação no site

---

## Pré-requisitos

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install pandas requests tqdm
```

---

## Passo 1 — Baixar os arquivos da Receita Federal

URL base: **https://dadosabertos.rfb.gov.br/CNPJ/**

Você precisa de dois grupos de arquivos:

- `Estabelecimentos0.zip` até `Estabelecimentos9.zip` → endereço, CNAE, situação
- `Empresas0.zip` até `Empresas9.zip` → razão social, porte

Total: ~6 GB comprimidos. Separe 30 a 90 minutos de download.

```python
# 1_download.py
import os, requests
from tqdm import tqdm

BASE = "https://dadosabertos.rfb.gov.br/CNPJ/"
PASTA = "dados_raw"
os.makedirs(PASTA, exist_ok=True)

arquivos = (
    [f"Estabelecimentos{i}.zip" for i in range(10)] +
    [f"Empresas{i}.zip" for i in range(10)]
)

for nome in arquivos:
    destino = os.path.join(PASTA, nome)
    if os.path.exists(destino):
        print(f"[JÁ EXISTE] {nome}")
        continue
    print(f"[BAIXANDO] {nome}")
    r = requests.get(BASE + nome, stream=True, timeout=60)
    total = int(r.headers.get("content-length", 0))
    with open(destino, "wb") as f, tqdm(total=total, unit="B", unit_scale=True) as barra:
        for chunk in r.iter_content(8192):
            f.write(chunk)
            barra.update(len(chunk))
```

```bash
python 1_download.py
```

---

## Passo 2 — Filtrar por CNAE e exportar

Lê os ZIPs, filtra apenas distribuidoras de alimentos ativas e salva um CSV limpo.

```python
# 2_filtrar.py
import os, zipfile, json
import pandas as pd

PASTA_RAW  = "dados_raw"
PASTA_OUT  = "dados_exportados"
os.makedirs(PASTA_OUT, exist_ok=True)

# CNAEs das distribuidoras de alimentos
CNAES = {
    "4631100": "Laticínios e leite",
    "4632001": "Cereais e leguminosas",
    "4632002": "Farinhas e amidos",
    "4633801": "Frutas e hortaliças frescas",
    "4633802": "Aves vivas e ovos",
    "4634601": "Carnes bovinas e suínas",
    "4634602": "Aves abatidas",
    "4634603": "Pescados e frutos do mar",
    "4635401": "Água mineral",
    "4635402": "Cerveja, chope e refrigerante",
    "4635499": "Outras bebidas",
    "4637101": "Café",
    "4637102": "Açúcar",
    "4637103": "Óleos e gorduras",
    "4637104": "Pães e biscoitos",
    "4637105": "Massas alimentícias",
    "4637106": "Sorvetes",
    "4637107": "Chocolates e confeitos",
    "4637199": "Alimentos em geral",
    "4639701": "Atacado alimentar geral",
    "4639702": "Cash and carry / Atacarejo",
}

COLUNAS = [
    "cnpj_basico", "cnpj_ordem", "cnpj_dv",
    "matriz_filial", "nome_fantasia",
    "situacao_cadastral", "data_situacao",
    "motivo_situacao", "cidade_exterior", "pais",
    "data_inicio_atividade", "cnae_principal",
    "cnae_secundario", "tipo_logradouro", "logradouro",
    "numero", "complemento", "bairro", "cep",
    "uf", "municipio_ibge",
    "ddd1", "telefone1", "ddd2", "telefone2",
    "ddd_fax", "fax", "email",
    "situacao_especial", "data_situacao_especial",
]

def processar_zip(zip_path):
    frames = []
    with zipfile.ZipFile(zip_path) as z:
        for nome in z.namelist():
            with z.open(nome) as f:
                df = pd.read_csv(
                    f, sep=";", header=None,
                    dtype=str, encoding="latin-1",
                    names=COLUNAS, on_bad_lines="skip"
                )
                df = df[df["situacao_cadastral"] == "02"]       # apenas ativas
                df = df[df["cnae_principal"].isin(CNAES.keys())]
                frames.append(df)
                print(f"  {nome}: {len(df):,} registros")
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

# Processa todos os ZIPs de Estabelecimentos
todos = []
for i in range(10):
    path = os.path.join(PASTA_RAW, f"Estabelecimentos{i}.zip")
    if not os.path.exists(path):
        continue
    print(f"\n[LENDO] Estabelecimentos{i}.zip")
    todos.append(processar_zip(path))

df = pd.concat(todos, ignore_index=True)
df = df.drop_duplicates(subset=["cnpj_basico", "cnpj_ordem", "cnpj_dv"])

# Monta CNPJ e campos formatados
df["cnpj"]     = df["cnpj_basico"].str.zfill(8) + df["cnpj_ordem"].str.zfill(4) + df["cnpj_dv"].str.zfill(2)
df["telefone"] = df.apply(lambda r: f"({r.ddd1}) {r.telefone1}" if r.ddd1 and r.telefone1 else r.telefone1, axis=1)
df["cep"]      = df["cep"].str.replace("-","").str.zfill(8)
df["categoria"] = df["cnae_principal"].map(CNAES)

# Seleciona campos finais
df_final = df[[
    "cnpj", "nome_fantasia", "cnae_principal", "categoria",
    "tipo_logradouro", "logradouro", "numero", "bairro",
    "cep", "uf", "municipio_ibge",
    "telefone", "email",
    "matriz_filial", "data_inicio_atividade",
]].fillna("")

# --- Exporta CSV ---
csv_path = os.path.join(PASTA_OUT, "distribuidoras_brasil.csv")
df_final.to_csv(csv_path, index=False, encoding="utf-8-sig")
print(f"\n[CSV] {csv_path}  ({len(df_final):,} registros)")

# --- Exporta JSON por UF ---
for uf, grupo in df_final.groupby("uf"):
    if not uf:
        continue
    out = os.path.join(PASTA_OUT, f"distribuidoras_{uf}.json")
    grupo.to_json(out, orient="records", force_ascii=False)
    print(f"[JSON] {out}  ({len(grupo):,})")

# --- Exporta JSON nacional único ---
df_final.to_json(
    os.path.join(PASTA_OUT, "distribuidoras_brasil.json"),
    orient="records", force_ascii=False
)
print("\nConcluído.")
```

```bash
python 2_filtrar.py
```

---

## Resultado gerado em `dados_exportados/`

| Arquivo | Descrição |
|---------|-----------|
| `distribuidoras_brasil.csv` | Todos os registros, UTF-8, separador vírgula |
| `distribuidoras_brasil.json` | JSON nacional completo |
| `distribuidoras_SP.json` | JSON por estado (um arquivo por UF) |

---

## Campos disponíveis para importação

| Campo | Exemplo |
|-------|---------|
| `cnpj` | `12345678000195` |
| `nome_fantasia` | `DISTRIBUIDORA NORTE` |
| `cnae_principal` | `4639701` |
| `categoria` | `Atacado alimentar geral` |
| `logradouro` | `RUA DAS FLORES` |
| `numero` | `120` |
| `bairro` | `CENTRO` |
| `cep` | `01310100` |
| `uf` | `SP` |
| `municipio_ibge` | `355030` (código IBGE) |
| `telefone` | `(11) 33334444` |
| `email` | `contato@empresa.com.br` |
| `matriz_filial` | `1` = matriz / `2` = filial |
| `data_inicio_atividade` | `20050312` |

> O campo `municipio_ibge` é o código numérico do IBGE.
> Para obter o nome, consulte:
> `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/{codigo}`

---

## Volume esperado

| Escopo | Registros estimados |
|--------|-------------------|
| Apenas generalistas (4639701 + 4639702) | 80 a 120 mil |
| Todos os CNAEs alimentares | 180 a 220 mil |
| Apenas matrizes | 100 a 130 mil |

---

## Atualização mensal

A Receita Federal atualiza os arquivos todo mês.
Basta rodar os dois scripts novamente. O script 1 pula arquivos já baixados.
Para forçar atualização, apague os ZIPs de `dados_raw/` e rode de novo.

---

*Fonte: Receita Federal — dadosabertos.rfb.gov.br*
*Licença: domínio público (Lei de Acesso à Informação nº 12.527/2011)*
