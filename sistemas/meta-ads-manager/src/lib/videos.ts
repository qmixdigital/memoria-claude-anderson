import { metaUpload, metaGet } from "./meta-client.ts";
import { getCliente } from "../config/clientes.ts";

interface VideoResp {
  id: string;
}

// Envia um video para a conta de anuncio e devolve o video_id.
export async function enviarVideo(
  clienteSlug: string,
  caminhoArquivo: string
): Promise<string> {
  const cliente = getCliente(clienteSlug);
  const file = Bun.file(caminhoArquivo);
  if (!(await file.exists())) {
    throw new Error(`Video nao encontrado: ${caminhoArquivo}`);
  }
  const nome = caminhoArquivo.split(/[\\/]/).pop() ?? "video.mp4";
  const form = new FormData();
  form.append("source", file, nome);

  const resp = await metaUpload<VideoResp>(
    `${cliente.adAccountId}/advideos`,
    form
  );
  if (!resp.id) throw new Error("Upload do video nao retornou id.");
  return resp.id;
}

interface VideoStatus {
  status?: { video_status?: string };
}

// A Meta processa o video de forma assincrona. So da para criar o anuncio
// depois que ele fica "ready". Aqui esperamos ate ficar pronto.
export async function aguardarVideoPronto(
  videoId: string,
  maxSegundos = 300
): Promise<void> {
  const inicio = Date.now();
  while ((Date.now() - inicio) / 1000 < maxSegundos) {
    const s = await metaGet<VideoStatus>(videoId, { fields: "status" });
    const st = s.status?.video_status;
    if (st === "ready") return;
    if (st === "error") {
      throw new Error("A Meta reportou erro no processamento do video.");
    }
    console.log(`  ...video processando (status: ${st ?? "?"})`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Tempo esgotado aguardando o video processar.");
}
