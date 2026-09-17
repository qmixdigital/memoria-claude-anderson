// Monta o McpServer e registra as ferramentas (em portugues, a Katia as ve).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHash } from "node:crypto";
import { db } from "../db.ts";
import { config } from "../config.ts";
import { listarSites, obterCredencial } from "../vault/sites.ts";
import { listarCategorias, listarTags } from "../wp/taxonomies.ts";
import { subirImagem } from "../wp/media.ts";
import { criarPost, atualizarPost, verificarPost } from "../wp/posts.ts";
import { WpError } from "../wp/client.ts";
import { notificarPublicacao } from "../notify/telegram.ts";
import { chaveDoEditor } from "../editor/client.ts";
import { registrarFerramentasEditor, INSTRUCOES_EDITOR } from "../editor/tools.ts";

// Resposta de texto simples para o Claude.
function texto(obj: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] };
}
function erro(msg: string) {
  return { content: [{ type: "text" as const, text: `ERRO: ${msg}` }], isError: true };
}

function credOuErro(slug: string) {
  const cred = obterCredencial(slug);
  if (!cred) throw new WpError(`Site "${slug}" nao encontrado no cofre. Use listar_sites.`, 404);
  return cred;
}

// Rate limit: conta posts criados no site na ultima hora.
function dentroDoLimite(slug: string): boolean {
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM publicacoes
       WHERE site_slug = ? AND quando >= datetime('now','-1 hour') AND post_id IS NOT NULL`,
    )
    .get(slug) as { n: number };
  return row.n < config.rateLimitPostsHora;
}

function registrarPublicacao(p: {
  usuario?: string;
  site_slug: string;
  post_id?: number;
  status?: string;
  titulo?: string;
  link?: string;
  conteudo_hash?: string;
}) {
  db.query(
    `INSERT INTO publicacoes (usuario, site_slug, post_id, status, titulo, link, conteudo_hash)
     VALUES ($u,$s,$p,$st,$t,$l,$h)`,
  ).run({
    $u: p.usuario ?? null,
    $s: p.site_slug,
    $p: p.post_id ?? null,
    $st: p.status ?? null,
    $t: p.titulo ?? null,
    $l: p.link ?? null,
    $h: p.conteudo_hash ?? null,
  });
}

function hashConteudo(titulo: string, html: string): string {
  return createHash("sha256").update(titulo + "\n" + html, "utf8").digest("hex");
}

export function criarMcpServer(usuarioOAuth?: string): McpServer {
  // Parceiro com chave da API do editor (EDITOR_API_USERS): ve so as
  // ferramentas que mandam para a fila do sistema Antonio, nunca o cofre WP.
  const chaveEditor = chaveDoEditor(usuarioOAuth);
  if (chaveEditor) {
    const server = new McpServer(
      { name: "editor-qmix", version: "1.0.0" },
      { instructions: INSTRUCOES_EDITOR },
    );
    registrarFerramentasEditor(server, chaveEditor);
    return server;
  }

  const server = new McpServer(
    { name: "wp-mcp-qmix", version: "1.0.0" },
    {
      instructions:
        "Conector para publicar artigos com imagem em portais WordPress parceiros da QMIX. " +
        "Sempre confirme o site com a usuaria antes de publicar. Nunca use travessoes no conteudo.",
    },
  );

  server.registerTool(
    "listar_sites",
    {
      title: "Listar portais",
      description:
        "Lista os portais parceiros cadastrados no cofre (slug, nome, url e se permite publicacao direta). " +
        "Use para resolver o nome dito pela usuaria para o slug correto antes de publicar.",
      inputSchema: {},
    },
    async () => {
      return texto(listarSites());
    },
  );

  server.registerTool(
    "listar_categorias",
    {
      title: "Listar categorias e tags do portal",
      description:
        "Retorna as categorias (e opcionalmente as tags) existentes em um portal, para escolher onde publicar.",
      inputSchema: {
        site: z.string().describe("slug do portal, vindo de listar_sites"),
        incluir_tags: z.boolean().optional().describe("se true, tambem retorna as tags existentes"),
      },
    },
    async ({ site, incluir_tags }) => {
      try {
        const cred = credOuErro(site);
        const categorias = await listarCategorias(cred);
        const out: Record<string, unknown> = { categorias };
        if (incluir_tags) out.tags = await listarTags(cred);
        return texto(out);
      } catch (e) {
        return erro(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    "subir_imagem",
    {
      title: "Subir imagem para o portal",
      description:
        "Baixa uma imagem de uma URL publica e a envia para a biblioteca de midia do portal. " +
        "Retorna o media_id para usar como imagem destacada em criar_post. " +
        "Use um nome de arquivo com a palavra-chave (bom para SEO) e um alt descritivo em portugues.",
      inputSchema: {
        site: z.string().describe("slug do portal"),
        url_imagem: z.string().url().describe("URL publica da imagem (JPG, PNG, WebP ou GIF)"),
        nome_arquivo: z.string().optional().describe("nome do arquivo, ex.: dor-no-joelho.webp"),
        alt: z.string().optional().describe("texto alternativo descritivo em portugues"),
        legenda: z.string().optional().describe("legenda opcional da imagem"),
      },
    },
    async ({ site, url_imagem, nome_arquivo, alt, legenda }) => {
      try {
        const cred = credOuErro(site);
        const r = await subirImagem(cred, { url_imagem, nome_arquivo, alt, legenda });
        return texto(r);
      } catch (e) {
        return erro(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    "criar_post",
    {
      title: "Criar post no portal",
      description:
        "Cria um artigo no portal. Por padrao publica ao vivo (status publish). " +
        "Se o portal so permitir rascunho, o servidor forca draft e avisa. " +
        "categorias sao ids (use listar_categorias); tags sao nomes (o servidor cria as que faltarem). " +
        "Para imagem destacada, passe o media_id retornado por subir_imagem.",
      inputSchema: {
        site: z.string().describe("slug do portal"),
        titulo: z.string().describe("titulo do artigo"),
        conteudo_html: z.string().describe("conteudo em HTML"),
        resumo: z.string().optional().describe("resumo/excerpt opcional"),
        slug: z.string().optional().describe("slug da URL, opcional"),
        categorias: z.array(z.number()).optional().describe("ids de categorias"),
        tags: z.array(z.string()).optional().describe("nomes de tags"),
        imagem_destaque_id: z.number().optional().describe("media_id da imagem destacada"),
        status: z
          .enum(["draft", "pending", "publish"])
          .optional()
          .describe("draft, pending ou publish (padrao: publish)"),
        agendar_para: z
          .string()
          .optional()
          .describe("data ISO para agendar (ex.: 2026-09-10T09:00:00); muda status para future"),
      },
    },
    async (args) => {
      try {
        const cred = credOuErro(args.site);

        // Regra do cofre: se o site nao permite publicar, rebaixa para draft.
        let status = args.status ?? "publish";
        let avisoStatus = "";
        if ((status === "publish" || args.agendar_para) && !cred.permite_publicar) {
          status = "draft";
          avisoStatus =
            " AVISO: este portal esta configurado para nao publicar direto; salvo como rascunho.";
        }

        // Rate limit.
        if (!dentroDoLimite(args.site)) {
          return erro(
            `Limite de ${config.rateLimitPostsHora} publicacoes por hora atingido para este portal. Tente mais tarde.`,
          );
        }

        // Dedupe: mesmo conteudo ja publicado neste site nos ultimos 10 min.
        const h = hashConteudo(args.titulo, args.conteudo_html);
        const dup = db
          .query(
            `SELECT post_id, link FROM publicacoes
             WHERE site_slug = ? AND conteudo_hash = ? AND quando >= datetime('now','-10 minutes')
             ORDER BY id DESC LIMIT 1`,
          )
          .get(args.site, h) as { post_id: number; link: string } | null;
        if (dup) {
          return texto({
            aviso: "Conteudo identico ja publicado neste portal ha instantes; nao dupliquei.",
            post_id: dup.post_id,
            link: dup.link,
          });
        }

        const r = await criarPost(cred, {
          titulo: args.titulo,
          conteudo_html: args.conteudo_html,
          resumo: args.resumo,
          slug: args.slug,
          categorias: args.categorias,
          tags: args.tags,
          imagem_destaque_id: args.imagem_destaque_id,
          status: args.agendar_para ? undefined : status,
          agendar_para: args.agendar_para,
        });

        registrarPublicacao({
          usuario: usuarioOAuth,
          site_slug: args.site,
          post_id: r.post_id,
          status: r.status,
          titulo: args.titulo,
          link: r.link,
          conteudo_hash: h,
        });

        await notificarPublicacao({
          portalNome: cred.nome,
          titulo: args.titulo,
          status: r.status,
          link: r.link,
          linkEdicao: r.link_edicao,
          usuario: usuarioOAuth,
          acao: "criado",
        });

        return texto({ ...r, aviso: avisoStatus.trim() || undefined });
      } catch (e) {
        return erro(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    "atualizar_post",
    {
      title: "Atualizar post existente",
      description:
        "Atualiza campos de um post ja criado (ex.: trocar status de draft para publish, corrigir titulo ou conteudo).",
      inputSchema: {
        site: z.string().describe("slug do portal"),
        post_id: z.number().describe("id do post a atualizar"),
        titulo: z.string().optional(),
        conteudo_html: z.string().optional(),
        resumo: z.string().optional(),
        slug: z.string().optional(),
        categorias: z.array(z.number()).optional(),
        tags: z.array(z.string()).optional(),
        imagem_destaque_id: z.number().optional(),
        status: z.enum(["draft", "pending", "publish"]).optional(),
      },
    },
    async (args) => {
      try {
        const cred = credOuErro(args.site);
        let status = args.status;
        if (status === "publish" && !cred.permite_publicar) status = "draft";
        const r = await atualizarPost(cred, args.post_id, {
          titulo: args.titulo,
          conteudo_html: args.conteudo_html,
          resumo: args.resumo,
          slug: args.slug,
          categorias: args.categorias,
          tags: args.tags,
          imagem_destaque_id: args.imagem_destaque_id,
          status,
        });
        registrarPublicacao({
          usuario: usuarioOAuth,
          site_slug: args.site,
          post_id: r.post_id,
          status: r.status,
          titulo: args.titulo ?? "(sem titulo)",
          link: r.link,
        });
        await notificarPublicacao({
          portalNome: cred.nome,
          titulo: args.titulo ?? `post ${r.post_id}`,
          status: r.status,
          link: r.link,
          linkEdicao: r.link_edicao,
          usuario: usuarioOAuth,
          acao: "atualizado",
        });
        return texto(r);
      } catch (e) {
        return erro(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    "verificar_post",
    {
      title: "Verificar post no ar",
      description:
        "Confere se um post ainda existe e em que status (util para relatorio de links de guest post).",
      inputSchema: {
        site: z.string().describe("slug do portal"),
        post_id: z.number().describe("id do post"),
      },
    },
    async ({ site, post_id }) => {
      try {
        const cred = credOuErro(site);
        return texto(await verificarPost(cred, post_id));
      } catch (e) {
        return erro(e instanceof Error ? e.message : String(e));
      }
    },
  );

  return server;
}
