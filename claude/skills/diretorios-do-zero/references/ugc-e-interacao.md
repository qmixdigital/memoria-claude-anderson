# UGC e Interação: Report, Correções, Avaliações, E-mail

## Botão "Informar erro" (obrigatório em toda ficha)

Chip âmbar destacado no card de contato. Trigger HTML (rede QMIX):

```html
<button type="button" class="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100">
  <svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.9">
    <path d="M10 7v4M10 14h.01" stroke-linecap="round"></path>
    <path d="M10 2.5 1.8 16.5a1 1 0 00.9 1.5h14.6a1 1 0 00.9-1.5L10 2.5z" stroke-linejoin="round"></path>
  </svg>Este lugar não existe? Informar erro
</button>
```
Adaptar o texto ao nicho ("Esta vidraçaria não existe?", "Este profissional não atende mais?"), mantendo a estrutura. Cor pode seguir a marca; o âmbar é bom por sinalizar alerta sem competir com o CTA principal (WhatsApp verde).

## Modal acessível (componente cliente)

O modal precisa: fechar com **ESC**, mover foco para dentro ao abrir e devolver ao fechar, prender o **Tab** (focus trap). Esqueleto:

```tsx
useEffect(() => {
  if (!open) return;
  const prev = document.activeElement as HTMLElement | null;
  selectRef.current?.focus();
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Tab" && dialogRef.current) {
      const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),select,textarea,input,[tabindex]:not([tabindex="-1"])');
      if (f.length) { const first=f[0], last=f[f.length-1];
        if (e.shiftKey && document.activeElement===first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement===last) { e.preventDefault(); first.focus(); } }
    }
  }
  document.addEventListener("keydown", onKey);
  return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);
```
Campos: tipo do problema (`closed` "não existe/fechou", `phone`, `whatsapp`, `address`, `name`, `other`), detalhes (opcional), nome + e-mail (opcional). POST em `/api/public/corrections`.

## Backend de correções

Schema (Drizzle):
```ts
export const correctionStatusEnum = pgEnum("correction_status", ["pending","resolved","ignored"]);
export const correctionTypeEnum = pgEnum("correction_type", ["phone","whatsapp","address","closed","name","other"]);
export const clinicCorrections = pgTable("clinic_corrections", {
  id: uuid().defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(()=>clinics.id,{onDelete:"cascade"}).notNull(),
  type: correctionTypeEnum("type").notNull(),
  description: text(), suggestion: text(),
  reporterName: varchar("reporter_name",{length:255}), reporterEmail: varchar("reporter_email",{length:255}),
  status: correctionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at",{mode:"date"}).defaultNow().notNull(),
});
```
API `POST /api/public/corrections`: validar com zod, rate-limit por IP, **verificar que a clínica existe antes de inserir** (evita linha lixo), inserir, e **`await notifyCorrection(...)`** (aguardar, senão o reload do PM2 corta o envio). Escapar todo dado do usuário com `escapeHtml` no e-mail/Telegram.

Cada report deve chegar onde o Anderson lê **e** ficar gravado com a URL da ficha. Sem admin, o canal é o e-mail/Telegram; com admin, painel `/admin/correcoes`. Testar ponta a ponta antes de entregar.

## E-mail: SMTP do Gmail, e o Resend saiu da rede

**A rede NÃO usa mais Resend.** Todo e-mail de formulário, report e aviso é
enviado por **SMTP autenticado do próprio Gmail** e chega em
**qmixdigital@gmail.com**.

**Por que mudou:** a chave do Resend venceu e devolveu 401 em silêncio em quatro
portais ao mesmo tempo (casasderecuperacao, clinicasrecuperacaosaopaulo,
qmix-next e Portal Engine). Nenhum formulário mandava e-mail e nada avisou. Some
a isso o `from` que exigia domínio verificado, coisa que domínio novo de
diretório nunca tem no dia 1: era 403 silencioso com o form respondendo 200.

Com SMTP do Gmail os dois problemas somem: **não há domínio para verificar** e a
caixa de destino é a mesma que a pessoa já abre todo dia.

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587            # STARTTLS. 465 tambem serve, com SSL direto.
SMTP_USER=qmixdigital@gmail.com
SMTP_PASS=...            # SENHA DE APP, nao a senha da conta
CONTACT_TO=qmixdigital@gmail.com
```

**Cinco coisas que mordem:**

1. **Senha de app, nunca a senha da conta.** Ela é gerada em Conta Google >
   Segurança > Senhas de app, e **exige verificação em duas etapas ligada**. Sem
   2FA a opção nem aparece.
2. **O Google mostra a senha com espaços** (`abcd efgh ijkl mnop`). Os espaços
   não fazem parte: tire antes de gravar. E ponha a linha entre aspas no `.env`.
3. **O `From` é reescrito pelo Gmail** para a conta autenticada. Dá para definir
   nome de exibição (`"Consultar Imóvel" <qmixdigital@gmail.com>`), mas o
   endereço não muda, a menos que o alias esteja configurado em "Enviar e-mail
   como" na conta.
4. **Limite diário.** Conta Gmail comum entrega na casa de algumas centenas de
   destinatários por dia. Para formulário de contato e aviso de fila, sobra; para
   disparo em massa, não serve, e a decisão passa a ser outra.
5. **O e-mail é o AVISO, não o registro.** O pedido grava no banco primeiro e o
   e-mail é notificação. Foi exatamente o que salvou os portais quando o Resend
   caiu: os reports continuaram existindo, só o aviso parou.

**Conferir `r.ok` ou capturar a exceção do envio, sempre.** Envio que falha em
silêncio marca o pedido como entregue e o registro se perde.

**O endereço publicado no site também é o Gmail.** Isso mata de vez o risco de
MX nulo: um domínio novo sem MX faria todo pedido de LGPD voltar como erro, num
canal com prazo de 15 dias declarado. Ainda assim, antes de publicar qualquer
endereço, `nslookup -type=MX` em dois resolvedores e um envio real com
confirmação de entrega.

## Avaliações (reviews) moderadas

Quando o nicho pede prova social: submissão pública → moderação (IA + humano via bot Telegram, prefixo por site) → publicação. `clinics.reviews_count`, tabela `clinic_reviews`. Estado vazio amigável ("Ainda não há avaliações... envie a sua, passa por moderação").

## Report vira limpeza (fecha o ciclo com a Fase 4)

- "Não existe / não é do nicho / fechou" procedente → remover + **blocklist por CNPJ/CNES** (não volta na reimportação).
- Pessoa física pedindo remoção → LGPD, atender sempre; blocklist por CNES.
- Verificar antes de remover CT/ficha legítima: report anônimo de "fechada" numa comunidade terapêutica real (que consta no SES estadual / redes sociais) **não** basta; confirmar (web/telefone) ou pedir confirmação do dono. Off-topic claro (clínica infantil, cardiologia) pode remover direto.
