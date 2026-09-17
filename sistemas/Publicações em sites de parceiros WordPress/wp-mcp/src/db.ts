// Banco SQLite unico: cofre de sites, clients/codes/tokens OAuth e auditoria.
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "data/vault.db";
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS sites (
  slug              TEXT PRIMARY KEY,
  nome              TEXT NOT NULL,
  url               TEXT NOT NULL,
  usuario           TEXT NOT NULL,
  senha_cifrada     TEXT NOT NULL,
  categoria_padrao  INTEGER,
  permite_publicar  INTEGER NOT NULL DEFAULT 1,
  ativo             INTEGER NOT NULL DEFAULT 1,
  observacoes       TEXT,
  criado_em         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id     TEXT PRIMARY KEY,
  client_secret TEXT,
  data_json     TEXT NOT NULL,
  criado_em     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_codes (
  code           TEXT PRIMARY KEY,
  client_id      TEXT NOT NULL,
  redirect_uri   TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  user_id        TEXT NOT NULL,
  scopes         TEXT NOT NULL DEFAULT '',
  resource       TEXT,
  expira_em      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  token       TEXT PRIMARY KEY,
  tipo        TEXT NOT NULL,           -- 'access' | 'refresh'
  client_id   TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  scopes      TEXT NOT NULL DEFAULT '',
  expira_em   INTEGER,                 -- epoch segundos; null para refresh
  criado_em   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS publicacoes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  quando      TEXT NOT NULL DEFAULT (datetime('now')),
  usuario     TEXT,
  site_slug   TEXT NOT NULL,
  post_id     INTEGER,
  status      TEXT,
  titulo      TEXT,
  link        TEXT,
  conteudo_hash TEXT
);
`);

// Migracao leve: adiciona colunas que possam faltar em bancos antigos.
function ensureColumn(tabela: string, coluna: string, ddl: string) {
  const cols = db.query(`PRAGMA table_info(${tabela})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === coluna)) {
    db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${ddl}`);
  }
}
ensureColumn("publicacoes", "conteudo_hash", "conteudo_hash TEXT");
