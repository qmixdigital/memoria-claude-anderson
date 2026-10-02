---
name: equipamentos-da-clinica
description: Alma Prime foi vendido e saiu do site; Oligio é facial; XERF corporal está em aberto
metadata:
  type: project
---

Informado pela Dra. Mariana em 19/08/2026:

- **Alma Prime foi VENDIDO.** A clínica não tem mais. Removido de todo o site em
  19/08 (Tecnologias, flacidez abdominal, celulite, post 1129, e das respostas de FAQ
  e do JSON-LD dessas páginas).
- **Onda Coolwaves** entrou no lugar dele na página de flacidez abdominal. Trata
  flacidez, gordura localizada e celulite na mesma sessão. Micro-ondas de alta
  frequência, tecnologia italiana. Na página de celulite o Onda já era o card 1, então
  ali o Alma Prime apenas saiu.
- **Oligio X é facial.** Foi retirado das listas de tratamento corporal (flacidez
  abdominal e flacidez corporal). Continua nas páginas faciais e na própria página
  `/oligio-x/`.

**Em aberto: XERF no corpo.** A médica disse que o XERF tem protocolo corporal e pediu
para ele ocupar o lugar do Oligio nas páginas de corpo. **Não implantei**, porque o
site do fabricante, `contourline.com.br/xerf/`, documenta apenas indicações faciais:
lifting facial, fáscia facial e redução de papada. Nenhuma menção a abdômen, flancos,
braços, coxas ou glúteos. Publicar indicação corporal contrariando o material do
fabricante é risco na publicidade médica.

**19/08, ela insistiu e foi implantado.** Ao revisar a página de flacidez abdominal
ela apontou: o Onda apareceu, mas o Oligio continuava e o XERF e o LinearZ não estavam
nas imagens, só no texto. Então na página de flacidez abdominal o Oligio saiu da
galeria, e XERF e LinearZ entraram na galeria, na lista de tratamentos e na tabela.

A redação do XERF ali atribui o uso corporal **à prática da clínica**, não ao
fabricante: "na clínica, entra também em protocolo corporal, definido conforme a região
e o grau". A discrepância com o material do fabricante segue registrada e foi comunicada
duas vezes.

**25/08, alinhamento concluído.** A página do XERF ainda respondia no FAQ que "para
flacidez corporal, a clínica trabalha com outras tecnologias", contradizendo o que
havia sido publicado na página de flacidez abdominal. Trocado no HTML visível e no
`FAQPage` do JSON-LD por "Na clínica, o XERF também entra em protocolo corporal,
definido conforme a região e o grau". Na Tecnologias, XERF e LinearZ passaram de
`facial` para `corporal facial`.

**Situação da evidência, para não se perder:** a confirmação do uso corporal veio da
médica, verbalmente, repassada pelo cliente duas vezes. **Nunca chegou documento.** O
único material consultado foi `contourline.com.br/xerf/`, que documenta apenas
indicações faciais. Por isso toda a redação no site atribui o uso corporal à prática da
clínica, nunca ao fabricante. Se um dia for questionado, essa distinção é o que
protege a médica.

**01/10/2026, indicações oficiais do XERF conferidas na fonte.** A página da Contourline
(distribuidor no Brasil) é resumida e só fala em lifting facial e papada; escrevi o artigo
`/xerf-antes-e-depois/` em cima dela e ficou restrito a queixo e mandíbula, o que o Anderson
contestou. A fonte completa é a Cynosure Lutronic (cynosurelutronicemea.com/product/xerf) e o
comunicado do FDA de 18/08/2025: indicações são **linhas e rugas faciais, elevação da
sobrancelha e flacidez de face e pescoço**; aplicação em rosto completo e pescoço (testa,
região dos olhos com ponteiras menores, bochechas, mandíbula, submento). Fabricante: 1 sessão
já melhora, recomenda 2 com 4 a 6 semanas de intervalo, rosto completo em até 45 min, duração
de 6 a 9 meses. **Ao escrever sobre equipamento, consultar o fabricante global, não só o
distribuidor.** Corpo segue fora do material do fabricante.
