// Categorias e tags.
import type { Credencial } from "../vault/sites.ts";
import { wpGet, wpPostJson, WpError } from "./client.ts";

export interface Termo {
  id: number;
  name: string;
  slug: string;
}

export async function listarCategorias(cred: Credencial): Promise<Termo[]> {
  return wpGet<Termo[]>(cred, "/categories?per_page=100&_fields=id,name,slug&orderby=name&order=asc");
}

export async function listarTags(cred: Credencial): Promise<Termo[]> {
  return wpGet<Termo[]>(cred, "/tags?per_page=100&_fields=id,name,slug&orderby=name&order=asc");
}

// Resolve nomes de tag para ids, criando as que faltam.
// Trata o caso term_exists (400) lendo o id que o WordPress devolve.
export async function resolverTags(cred: Credencial, nomes: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const nomeBruto of nomes) {
    const nome = nomeBruto.trim();
    if (!nome) continue;

    // Procura por termo com nome exato (case-insensitive).
    const achados = await wpGet<Termo[]>(
      cred,
      `/tags?search=${encodeURIComponent(nome)}&per_page=100&_fields=id,name,slug`,
    );
    const exato = achados.find((t) => t.name.toLowerCase() === nome.toLowerCase());
    if (exato) {
      ids.push(exato.id);
      continue;
    }

    // Nao existe: tenta criar.
    try {
      const criada = await wpPostJson<Termo>(cred, "/tags", { name: nome });
      ids.push(criada.id);
    } catch (e) {
      // term_exists com corrida: o WordPress devolve o id no payload de erro.
      if (e instanceof WpError && e.code === "term_exists") {
        const termId = e.data?.term_id;
        if (typeof termId === "number") {
          ids.push(termId);
          continue;
        }
      }
      throw e;
    }
  }
  return ids;
}
