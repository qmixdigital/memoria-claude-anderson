# Monetização direta: venda de banner no próprio diretório

Espaço publicitário vendido direto ao anunciante (complementa o AdSense; costuma render mais no nível local). Slots nas páginas de **listagem** (cidade, estado, categoria, serviço). Quando o slot não está vendido, mostra um placeholder "Seu banner aqui" que leva ao contato para comprar o espaço, o que também serve de prospecção.

## Modelo de dados (tabela própria, fora da base ingerida)

```sql
CREATE TABLE IF NOT EXISTS ad_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type varchar(20) NOT NULL,   -- 'home' | 'state' | 'city' | 'category' | 'service'
  scope_id   varchar(120),           -- slug do estado/cidade/categoria (null = qualquer/geral)
  position   varchar(30) NOT NULL DEFAULT 'listing_top', -- onde renderiza
  image_url  text NOT NULL,
  target_url text NOT NULL,
  alt        text,
  advertiser text,
  starts_at  timestamptz,
  ends_at    timestamptz,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ad_banners_scope_idx ON ad_banners (scope_type, scope_id, position, active);
```

Importante: é tabela **editorial**, não tocada pelo merge da ingestão (diferente das fichas). Sobrevive a reimportações.

## Resolução do slot (server)

Para uma página (ex.: cidade `sorocaba-sp`, posição `listing_top`), buscar banner ativo e vigente; se não houver, cair para o placeholder:

```ts
const [banner] = await db.select().from(adBanners).where(and(
  eq(adBanners.active, true),
  eq(adBanners.position, position),
  eq(adBanners.scopeType, scopeType),
  or(eq(adBanners.scopeId, scopeId), isNull(adBanners.scopeId)),
  or(isNull(adBanners.startsAt), lte(adBanners.startsAt, new Date())),
  or(isNull(adBanners.endsAt),   gte(adBanners.endsAt,   new Date())),
)).orderBy(desc(adBanners.scopeId)).limit(1); // prioriza o específico sobre o geral
```

## Componente (slot com altura reservada — evita CLS)

```tsx
export function AdSlot({ banner, waContext }: { banner: Banner | null; waContext: string }) {
  return (
    <div className="my-6 min-h-[90px] w-full"> {/* altura reservada */}
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">Publicidade</span>
      {banner ? (
        <a href={banner.targetUrl} target="_blank" rel="sponsored nofollow noopener"
           className="block overflow-hidden rounded-xl border border-border">
          <img src={banner.imageUrl} alt={banner.alt || "Anúncio"} width={728} height={90}
               loading="lazy" className="h-auto w-full" />
        </a>
      ) : (
        // PLACEHOLDER CHAMATIVO (não discreto): fundo sólido/gradiente da paleta
        // do site, título em negrito e botão de CTA contrastante. Objetivo é
        // VENDER o espaço, então tem que saltar aos olhos.
        <a href={`/contato?assunto=${encodeURIComponent("Quero anunciar meu banner na página de " + waContext)}`}
           className="group flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[COR_PRIMARIA] to-[COR_SECUNDARIA] px-6 py-5 text-center shadow-lg transition-transform hover:-translate-y-0.5 sm:flex-row sm:text-left">
          <span className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-2xl">📢</span>
            <span className="flex flex-col">
              <span className="text-base font-extrabold text-white sm:text-lg">Anuncie sua empresa/serviço aqui</span>
              <span className="text-sm text-white/90">Apareça em destaque para quem procura em {waContext}.</span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-[COR_PRIMARIA] shadow-sm">
            Quero anunciar →
          </span>
        </a>
      )}
    </div>
  );
}
```

## Regras (não pular)

- **Link pago = `rel="sponsored nofollow"`** no banner vendido. Link pago sem marcação é esquema de link (risco de ação manual no Google). O placeholder para WhatsApp também vai `nofollow`.
- **Rótulo "Publicidade"** no vendido e **"Anuncie aqui"** no vazio. Transparência com o usuário e com o AdSense.
- **Placeholder CHAMATIVO, na paleta do site.** O espaço vazio precisa saltar aos olhos (é o que vende o espaço): fundo sólido ou gradiente com as cores da marca do site, título em negrito, ícone e um botão de CTA contrastante (ex.: botão branco sobre fundo colorido). NUNCA discreto, tracejado apagado ou cinza. Usar a paleta específica de cada site (ex.: clínicas SP usa azul #0052CC → teal #00B8D9). O banner VENDIDO, ao contrário, é a arte do anunciante (sóbrio, só a imagem + rótulo).
- **Altura fixa reservada** no slot (CLS 0). Imagem `loading="lazy"` com `width`/`height`.
- **Placeholder com contexto** no texto do WhatsApp (cidade/categoria), para o Anderson saber onde o anunciante quer aparecer.
- **Densidade**: não colar o slot direto vendido ao lado de bloco AdSense; espaçar. Máximo 1-2 slots por página de listagem.
- **Escopo específico ganha do geral** (banner da cidade X vence o banner "geral").
- Começar **manual** (Anderson cadastra o banner e cobra por fora). Autoatendimento/checkout é evolução futura, não requisito inicial.
- Não vender banner em página de ficha individual thin nem em 404/erro/admin.
