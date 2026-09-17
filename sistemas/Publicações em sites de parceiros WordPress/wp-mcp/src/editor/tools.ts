// Ferramentas MCP que falam com a API do editor (sistema Antonio). Registradas
// no lugar das ferramentas WordPress quando o usuario OAuth tem chave da API:
// o parceiro so ve os sites liberados para ele e tudo que envia aparece no
// painel dele em editor.qmix.com.br.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { editorApi } from "./client.ts";

function texto(obj: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] };
}
function erro(msg: string) {
  return { content: [{ type: "text" as const, text: `ERRO: ${msg}` }], isError: true };
}
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const INSTRUCOES_EDITOR =
  "Conector para enviar artigos aos sites da rede QMIX liberados para este parceiro. " +
  "O artigo entra numa fila e e publicado automaticamente em poucos minutos; a URL final " +
  "aparece em situacao_artigo. Fluxo: listar_sites, listar_categorias, (opcional) subir_imagem, " +
  "enviar_artigo, situacao_artigo. Confirme o site com o usuario antes de enviar. " +
  "Nunca use travessao no conteudo: a API recusa. Escreva em portugues do Brasil com acentos.";

export function registrarFerramentasEditor(server: McpServer, chave: string): void {
  server.registerTool(
    "listar_sites",
    {
      title: "Listar sites liberados",
      description:
        "Lista os sites da rede QMIX liberados para este parceiro (dominio, url e nome do autor " +
        "que assina os posts). Use o campo 'dominio' nas outras ferramentas.",
      inputSchema: {},
    },
    async () => {
      try {
        const r = await editorApi.dominios(chave);
        return texto({ total: r.total, sites: r.dominios });
      } catch (e) {
        return erro(msg(e));
      }
    },
  );

  server.registerTool(
    "listar_categorias",
    {
      title: "Listar categorias do site",
      description: "Categorias disponiveis em um site liberado. Passe o id escolhido em enviar_artigo.",
      inputSchema: {
        dominio: z.string().describe("dominio do site, ex.: revistarumo.com.br"),
      },
    },
    async ({ dominio }) => {
      try {
        return texto(await editorApi.categorias(chave, dominio));
      } catch (e) {
        return erro(msg(e));
      }
    },
  );

  server.registerTool(
    "subir_imagem",
    {
      title: "Preparar imagem do artigo",
      description:
        "Baixa uma imagem de uma URL publica (ou recebe em base64), converte para WebP 1200x675 e " +
        "devolve a imagem_url para usar em enviar_artigo. De um nome com a palavra-chave do artigo. " +
        "Prefira foto de banco gratuito (Pexels, Pixabay); nada de texto dentro da imagem.",
      inputSchema: {
        url_imagem: z.string().url().optional().describe("URL publica da imagem (JPG, PNG, WebP ou GIF)"),
        base64: z.string().optional().describe("alternativa: a imagem em base64"),
        nome: z.string().optional().describe("nome base do arquivo, ex.: dor-no-joelho"),
      },
    },
    async ({ url_imagem, base64, nome }) => {
      try {
        if (!url_imagem && !base64) return erro("Informe url_imagem ou base64.");
        return texto(await editorApi.enviarImagem(chave, { url: url_imagem, base64, nome }));
      } catch (e) {
        return erro(msg(e));
      }
    },
  );

  server.registerTool(
    "enviar_artigo",
    {
      title: "Enviar artigo para publicacao",
      description:
        "Envia um artigo para a fila de publicacao de um site liberado. Publica automaticamente em " +
        "poucos minutos (ou na data de agendar_para). Devolve o id para acompanhar em situacao_artigo. " +
        "conteudo_html: corpo em HTML (p, h2, h3, ul, ol, a, strong), sem repetir o titulo, sem travessao.",
      inputSchema: {
        dominio: z.string().describe("dominio do site, vindo de listar_sites"),
        titulo: z.string().max(500).describe("titulo do artigo (H1)"),
        conteudo_html: z.string().describe("conteudo em HTML"),
        linha_fina: z.string().optional().describe("uma frase de 10 a 20 palavras abaixo do titulo"),
        meta_description: z.string().optional().describe("150 a 160 caracteres para o Google"),
        categoria_id: z.number().int().optional().describe("id vindo de listar_categorias"),
        imagem_url: z.string().url().optional().describe("imagem_url devolvida por subir_imagem (ou URL externa)"),
        agendar_para: z
          .string()
          .optional()
          .describe("data ISO 8601 no horario de Brasilia, ex.: 2026-09-20T09:00:00-03:00; omita para publicar agora"),
      },
    },
    async (args) => {
      try {
        return texto(await editorApi.enviarArtigo(chave, args));
      } catch (e) {
        return erro(msg(e));
      }
    },
  );

  server.registerTool(
    "situacao_artigo",
    {
      title: "Situacao de um artigo",
      description:
        "Diz se o artigo esta na fila, agendado, publicado (com a URL final) ou se falhou (com o motivo).",
      inputSchema: {
        id: z.number().int().describe("id devolvido por enviar_artigo"),
      },
    },
    async ({ id }) => {
      try {
        return texto((await editorApi.artigo(chave, id)).artigo);
      } catch (e) {
        return erro(msg(e));
      }
    },
  );

  server.registerTool(
    "meus_artigos",
    {
      title: "Ultimos artigos enviados",
      description: "Lista os ultimos artigos deste parceiro com a situacao e a URL de cada um.",
      inputSchema: {
        limite: z.number().int().min(1).max(100).optional().describe("quantos (padrao 20)"),
      },
    },
    async ({ limite }) => {
      try {
        return texto((await editorApi.artigos(chave, limite ?? 20)).artigos);
      } catch (e) {
        return erro(msg(e));
      }
    },
  );
}
