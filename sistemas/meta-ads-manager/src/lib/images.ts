import { metaUpload } from "./meta-client.ts";
import { getCliente } from "../config/clientes.ts";

interface AdImageResp {
  // a Meta devolve um mapa { "nome-do-arquivo": { hash, url } }
  images: Record<string, { hash: string; url: string }>;
}

// Envia uma imagem do disco para a conta de anuncio do cliente e
// devolve o image_hash, que e o que o creative usa para montar o anuncio.
export async function enviarImagem(
  clienteSlug: string,
  caminhoArquivo: string
): Promise<string> {
  const cliente = getCliente(clienteSlug);

  const file = Bun.file(caminhoArquivo);
  if (!(await file.exists())) {
    throw new Error(`Imagem nao encontrada: ${caminhoArquivo}`);
  }

  const nomeArquivo = caminhoArquivo.split(/[\\/]/).pop() ?? "imagem";
  const form = new FormData();
  form.append(nomeArquivo, file, nomeArquivo);

  const resp = await metaUpload<AdImageResp>(
    `${cliente.adAccountId}/adimages`,
    form
  );

  const primeira = Object.values(resp.images)[0];
  if (!primeira?.hash) {
    throw new Error("Upload da imagem nao retornou hash.");
  }
  return primeira.hash;
}
