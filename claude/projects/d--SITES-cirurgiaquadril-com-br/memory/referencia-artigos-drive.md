---
name: referencia-artigos-drive
description: Pasta do Drive onde a redatora entrega os artigos do blog de cirurgiaquadril.com.br e como conferir por API
metadata:
  type: reference
---

Os artigos do blog chegam pela pasta do Drive https://drive.google.com/drive/folders/<<REMOVIDO>> (ID <<REMOVIDO>>, nome "CIRURGIA DE QUADRIL"). Dentro dela fica a planilha de temas ARTIGOS (<<REMOVIDO>>, abas: Temas dos artigos, Instruções para a redatora, Palavras-chave do Search Console).

**Como conferir:** quando o Anderson disser "veja se chegaram novos artigos", rodar `python D:\SITES\cirurgiaquadril.com.br\_build\checar_artigos.py` (lista os arquivos e marca NOVO/ATUALIZADO; `--ler ID` imprime o texto de um Doc ou .docx). Usa a conta seoqmix@seoqmix.iam.gserviceaccount.com (chave `<<REMOVIDO>>`), que é editora da pasta. O estado fica em `_build/artigos_vistos.json`.

**Why:** o fluxo combinado é a redatora enviar tudo por essa pasta e o Anderson pedir a conferência a cada rodada, sem aviso automático.

**How to apply:** ao chegar artigo novo: ler o texto, conferir contra as regras (CFM 2.336/2023 sem prometer resultado/preço/superlativo, sem travessão, H1 = palavra-chave principal da linha da planilha, primeiro link para a página indicada, FAQ, tom educativo) e avisar o que corrigir; publicar só após revisão clínica dos dois médicos (a página /blog está com noindex e fora do sitemap até o primeiro artigo; ao publicar, tirar o noindex, entrar no sitemap, reenviar IndexNow e sitemap ao Search Console e Bing) e atualizar a coluna Status da planilha. Ver [[projeto-cirurgiaquadril]].
