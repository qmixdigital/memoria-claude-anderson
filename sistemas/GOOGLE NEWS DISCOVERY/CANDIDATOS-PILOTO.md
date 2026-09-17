# Candidatos ao piloto — pós adoção do master (20/08/2026)

Com o `.token_master`, a cobertura foi de 41 para **112 de 113**, e o critério de escolha mudou.

## O critério antigo caducou

A estratégia de concentrar em poucas contas existia para minimizar a superfície da skip rule, quando cada conta exigia seu token. **O master aplica em qualquer zona com um comando**, então concentrar por conta deixou de valer alguma coisa.

## O critério que passa a valer: portal-engine antes de WordPress

Dos 112 cobertos, **49 rodam no portal-engine** e 63 são WordPress da plataforma.

Os do portal-engine são candidatos mais fortes, e não por gosto:

- o receptor é o que eu li linha a linha: guarda de exclusividade de slug, `exigeImagem`, `categoryMap`, `equipe`
- as três armadilhas que o publicador trata (`skipped` disfarçado de 201, rascunho sem imagem, categoria nova poluindo o menu) foram mapeadas nesse motor
- no WordPress o receptor é o plugin do Antônio, cujo comportamento eu **não** auditei: colisão de slug, categoria e autor podem se comportar diferente

Começar a rampa onde o comportamento é conhecido isola a variável certa. WordPress entra depois, quando o padrão estiver provado.

## Portal-engine cobertos, por instância

| Domínio | Instância |
|---|---|
| `agencianacionaldenoticias.com` | clinicas-vps|
| `agoranoticias.net` | clinicas-vps|
| `barranews.com.br` | clinicas-vps|
| `boxnoticias.net` | clinicas-vps|
| `clickinfohub.com` | clinicas-vps|
| `dataroomus.com` | clinicas-vps|
| `diariodegoiania.com` | srv1166087|
| `diariodobrejo.com` | srv1166087|
| `edenoticias.com` | srv1166087|
| `editaldeconcurso.net` | clinicas-vps|
| `entrenoticia.com` | srv1166087|
| `folhaum.com` | srv1166087|
| `gdsnoticias.com` | srv1166087|
| `girodasnoticias.com` | clinicas-vps|
| `gpnoticias.com` | clinicas-vps|
| `jornalacapital.com` | clinicas-vps|
| `jornalconceito.com` | clinicas-vps|
| `jornaldebarcelos.com` | clinicas-vps|
| `jornaldiario.net` | srv1166087|
| `jornalimigrantes.com` | clinicas-vps|
| `jornalistanofato.com` | clinicas-vps|
| `manacultura.com` | clinicas-vps|
| `maragoginoticias.com` | clinicas-vps|
| `mgnoticias.net` | clinicas-vps|
| `nodiario.com` | clinicas-vps|
| `noticias9.com` | clinicas-vps|
| `noticiasagoras.com` | clinicas-vps|
| `noticiasdasemana.com` | clinicas-vps|
| `noticiasdiarios.com` | clinicas-vps|
| `noticiasdodia.net` | clinicas-vps|
| `noticiasdojogo.com` | clinicas-vps|
| `noticiasgoias.com` | clinicas-vps|
| `noticiasubuntu.com` | clinicas-vps|
| `ocontraditorio.com` | clinicas-vps|
| `olharmoderno.com` | clinicas-vps|
| `osertaoenoticia.com` | clinicas-vps|
| `portalnoticiasbh.com` | clinicas-vps|
| `portalr5.com` | clinicas-vps|
| `professortic.com` | clinicas-vps|
| `projetob.net` | srv1166087|
| `r10noticias.com` | clinicas-vps|
| `riachonoticias.net` | clinicas-vps|
| `romanceseleituras.com` | srv1166087|
| `rsnoticias.net` | clinicas-vps|
| `rumourisnews.com` | clinicas-vps|
| `semtedio.com` | clinicas-vps|
| `tempusnoticias.com` | clinicas-vps|
| `todossomosgeek.com` | srv1166087|
| `topsulnoticias.com` | clinicas-vps|

## WordPress cobertos (fase seguinte)

| Domínio |
|---|
| `adonline.com.br` |
| `advivo.com.br` |
| `azulmagazine.com.br` |
| `blogse.com.br` |
| `cameracotidiana.com.br` |
| `cirurgiacoracao.com.br` |
| `cirurgiadacatarata.com.br` |
| `cirurgiadecancer.com.br` |
| `curiosododia.com.br` |
| `desassossegada.com.br` |
| `df8.com.br` |
| `diariodatv.com` |
| `diariopernambucano.com.br` |
| `divirto.com.br` |
| `ebookcult.com.br` |
| `euvo.com.br` |
| `exquisito.com.br` |
| `ferronoticias.net` |
| `filmeseseriesnovas.com` |
| `folhadonoroeste.com.br` |
| `folhar.com.br` |
| `gazetaalerta.com` |
| `gazetadoconsumidor.com` |
| `gazetaretina.com` |
| `institutoortopedico.com.br` |
| `jornaldabahia.net` |
| `jornaldinamico.com` |
| `jornaldobairroalto.com.br` |
| `jornalexpresso.net` |
| `jornalsaosimao.com` |
| `jrnoticias.com` |
| `matogrossosaude.com.br` |
| `medicinageriatrica.com.br` |
| `medicodasmaos.com.br` |
| `mundodasnoticias.net` |
| `nerddahora.com` |
| `notebookx.com.br` |
| `oiempreendedores.com.br` |
| `opopularjornal.com.br` |
| `ortopediacoluna.com.br` |
| `ortopedistadeombro.com.br` |
| `planomedicosaude.com.br` |
| `pneusemgoiania.com.br` |
| `pontonaturalbrasil.com.br` |
| `publisherbrasil.com.br` |
| `qmixdigital.com.br` |
| `revistadeducao.com.br` |
| `revistarumo.com.br` |
| `revistatopsaude.com.br` |
| `sabedoriaglobal.com.br` |
| `saberdefato.com.br` |
| `saudeacessivel.com.br` |
| `saudeemalta.net.br` |
| `saudevitalidade.com.br` |
| `saudicas.com.br` |
| `sejanoticia.com` |
| `setorenergetico.com.br` |
| `tribunainformativa.com` |
| `tribunalpopular.org` |
| `umjornal.com` |
| `universoneo.com.br` |
| `viajenodetalhe.com.br` |
| `wtw19.com.br` |

## Fora de alcance

`incast.com.br` — conta de terceiro, fora das 78 do master. Não é candidato.
