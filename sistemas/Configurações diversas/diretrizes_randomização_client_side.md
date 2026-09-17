# Diretrizes: Randomização Client-Side no Botão Hero

## O que é

Técnica de distribuição de tráfego aplicada no botão CTA da seção Hero de todos os nossos sites. O clique no botão redireciona o visitante para uma entre várias URLs de destino, alternando entre elas de forma equilibrada.

## Objetivo

Distribuir o tráfego de forma justa entre múltiplas plataformas/parceiros, sem depender de serviços externos de A/B testing ou redirecionamento server-side.

## Regra

**Todo site DEVE ter randomização client-side no botão CTA do Hero.**

---

## Como funciona

### Lógica de distribuição

1. **Primeira visita:** usa o minuto atual (`new Date().getMinutes() % N`) para distribuir o clique entre as URLs de forma pseudo-aleatória
2. **Visitas subsequentes:** alterna em relação ao último clique armazenado no `localStorage`
3. **Fallback:** se o `localStorage` estiver bloqueado (navegação privada, cookies desativados), usa o timestamp como fallback

### Armazenamento

- Chave no `localStorage`: `{slug_do_site}_cta_last`
- Valor: índice numérico da última URL usada (`"0"`, `"1"`, `"2"`, etc.)

### Abertura do link

- Sempre em nova aba: `window.open(url, '_blank', 'noopener,noreferrer')`
- Flags de segurança `noopener,noreferrer` obrigatórias

---

## Implementação — Next.js (React/TSX)

Arquivo: `src/components/HeroCTA.tsx`

```tsx
'use client'

const urls = [
  'https://url-destino-1.com/',
  'https://url-destino-2.com/',
]

export default function HeroCTA() {
  const handleClick = () => {
    let index: number
    const totalUrls = urls.length

    try {
      const last = localStorage.getItem('<<REMOVIDO>>')
      const lastIndex = Number(last)

      if (!isNaN(lastIndex) && lastIndex >= 0 && lastIndex < totalUrls) {
        // Alterna para a próxima URL em relação ao último clique
        index = (lastIndex + 1) % totalUrls
      } else {
        // Primeira visita: distribui pelo minuto atual
        index = new Date().getMinutes() % totalUrls
      }
      localStorage.setItem('<<REMOVIDO>>', String(index))
    } catch {
      // Fallback se localStorage estiver bloqueado
      index = new Date().getMinutes() % totalUrls
    }

    window.open(urls[index], '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-primary btn-lg"
    >
      Texto do Botão CTA
    </button>
  )
}
```

**Uso no Hero:**
```tsx
import HeroCTA from '@/components/HeroCTA'

<section className="hero">
  <div className="hero-text">
    <h1>Título do Site</h1>
    <p>Subtítulo descritivo</p>
    <HeroCTA />
  </div>
  <div className="hero-image">
    <img src="..." alt="..." />
  </div>
</section>
```

---

## Implementação — HTML Estático (Vanilla JS)

Inserir o script inline no HTML da página, logo antes do `</body>`:

```html
<button type="button" id="hero-cta" class="btn btn-primary btn-lg">
  Texto do Botão CTA
</button>

<script>
(function() {
  var urls = [
    'https://url-destino-1.com/',
    'https://url-destino-2.com/'
  ];
  var total = urls.length;
  var storageKey = '<<REMOVIDO>>';

  document.getElementById('hero-cta').addEventListener('click', function() {
    var index;
    try {
      var last = localStorage.getItem(storageKey);
      var lastIndex = Number(last);
      if (!isNaN(lastIndex) && lastIndex >= 0 && lastIndex < total) {
        index = (lastIndex + 1) % total;
      } else {
        index = new Date().getMinutes() % total;
      }
      localStorage.setItem(storageKey, String(index));
    } catch(e) {
      index = new Date().getMinutes() % total;
    }
    window.open(urls[index], '_blank', 'noopener,noreferrer');
  });
})();
</script>
```

---

## Checklist ao implementar

- [ ] Substituir as URLs no array `urls` pelas URLs reais do projeto
- [ ] Substituir `SLUG_DO_SITE` na chave do localStorage pelo slug real (ex: `lepur_cta_last`, `skipark_cta_last`)
- [ ] O botão DEVE estar na seção Hero (acima do fold)
- [ ] O botão DEVE usar `type="button"` (não `type="submit"`)
- [ ] Testar em navegação normal e privada (fallback deve funcionar)
- [ ] Verificar que as URLs abrem em nova aba
- [ ] Em Next.js: o componente DEVE ter `'use client'` no topo

---

## Projeto de referência

- **Site:** Lepur
- **Arquivo:** `D:\SITES\lepur\src\components\HeroCTA.tsx`
- **URLs usadas:** `nexoplay.mov` e `zapplus.mov`
- **Chave localStorage:** `lepur_cta_last`
