---
name: cascata-download-regras
description: Regras permanentes do router de download do Cortes IA (cascata, portao de qualidade, reprocessamento)
metadata:
  type: feedback
---

Tres regras permanentes que o Anderson impos para o router de download, todas
nascidas de prejuizo real:

1. **Nao alterar `cascata_ordem` nem promover camada sem ordem explicita dele.**
   Nem mudanca pequena, nem "obvia".
2. **Resolucao real medida por ffprobe no arquivo e criterio eliminatorio.**
   Rotulo de API mente: SocialKit e TrueFetch anunciam 1080p e entregam 360p.
3. **Reprocessar job com execucao viva e proibido** (guarda de heartbeat em
   `src/lib/queue.ts`); so passa com `forcar: true`.

**Why:** cada tentativa de download e paga. Um job com falha permanente repetido
pelo BullMQ queimou 6 downloads pagos para jogar tudo fora, e um reprocessamento
indevido meu duplicou a execucao de um cliente e cobrou credito a mais.

**How to apply:** antes de mexer em camada, medir com ffprobe e mostrar o numero
a ele; a decisao de promover e dele. Falha permanente (`quality_below_min`,
video privado/removido, regra de negocio) vira `UnrecoverableError` e falha uma
vez so. Ver [[ffmpeg-static-segfault-rede]] para o caminho de probe na rede.
