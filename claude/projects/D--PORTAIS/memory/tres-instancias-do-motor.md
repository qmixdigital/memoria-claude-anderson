---
name: tres-instancias-do-motor
description: "A rede roda em três servidores com versões diferentes do portal-engine, e as letras de arquitetura são independentes em cada um"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T18:22:25.229Z
---

O `portal-engine` não roda num servidor só. São **três**, com versões diferentes
do motor e numeração de arquitetura **independente**:

| Servidor | Alias SSH | Portais | Arquiteturas |
|---|---|---|---|
| clinicas-vps `31.97.162.199` | `clinicas-vps` | 34 | A até BB (54) |
| Hostinger srv1166087 `31.97.173.40` | `hostinger-vps-srv1166087` | 12 | A até L |
| VPS OpenGravity `77.37.69.175` | `opengravity` | 7 | A até T |

**A letra da arquitetura só é única dentro do servidor.** Arch `L` no
srv1166087 (entrenoticia) não tem relação com arch `L` na OpenGravity (wtw19).
Antes de escolher uma letra livre, olhe o `archs.js` **daquele** servidor.

Os dois motores antigos receberam por porte, em 16/08/2026: hash de nome de
classe, banner de LGPD, corte de title em 60, suporte a `extraPages` e página de
autor, e `autoLinkContent` (que só faltava no srv1166087). O que ainda os separa
do motor novo é o resto do `render.js`, que não foi trocado de propósito: são 19
domínios no ar e a troca inteira arriscaria todos para ganhar o que coube em
poucos enxertos.

Ver [[deploy-arch-nao-cortar-vizinha]] e [[arch-local-e-fonte-unica]].
