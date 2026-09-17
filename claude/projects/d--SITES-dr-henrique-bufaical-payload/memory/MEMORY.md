# Dr. Henrique Bufaiçal - Project Memory

## Project Overview
Medical practice website for an orthopedic/hand surgeon (Goiânia, Brazil).
Stack: **Payload CMS 3.27 + Next.js 15.4 + React 19 + PostgreSQL (Neon) + Vercel Blob**

## Key Paths
- Root: `d:/SITES/dr-henrique-bufaical-payload/`
- Payload config: `src/payload.config.ts`
- Next.js config: `next.config.mjs`
- Types (auto-generated): `src/payload-types.ts`
- Internal links/SEO logic: `src/lib/internal-links.ts`
- Utilities: `src/lib/utils.ts`

## Collections
- **Users** - CMS auth
- **Pages** - Block-based pages, `isHome` flag for home page
- **Posts** - Blog articles (draft/published, categories, SEO)
- **Tratamentos** - Treatment/specialty pages (custom layout sections)
- **Categories** - Post categories
- **Media** - Images via Vercel Blob

## Globals
- **Header** - Logo + nav with nested children
- **Footer** - Links, description, copyright
- **SiteConfig** - WhatsApp, phone, address, social, CRM/RQE, GA ID (G-D8XTYGV1N5)

## Blocks (16 types)
Hero, StatsBar, About, SpecialtiesGrid, SpecialtiesPageIntro, SpecialtiesPageGrid,
ContactForm, ContactInfo, Process, WhyChoose, CTA, Testimonials, RichContent,
Map, DoctorProfile, Training, TermsCTA

## Frontend Routes
- `/` → home page (Pages collection, isHome: true)
- `/[slug]` → Pages OR Tratamentos (falls back to blog redirect)
- `/blog` → paginated blog (12/page, category filter)
- `/blog/[slug]` → single post
- `/sitemap.ts`, `/robots.ts`

## SEO Features
- ISR revalidation: 3600s (1h) on all pages
- Internal link injection via `injectInternalLinks()` (skips headings, one per rule)
- 14 tratamento links + 60+ blog cross-links in `src/lib/internal-links.ts`
- JSON-LD: Physician schema, Article schema, BreadcrumbList
- WordPress migration redirects in `next.config.mjs`

## Commands
```
npm run dev          # dev server
npm run build        # production build
npm run seed         # seed database
npm run generate:types  # regenerate payload-types.ts
```

## Environment Variables
- `DATABASE_URI` - Neon PostgreSQL
- `PAYLOAD_SECRET` - Payload auth secret
- `NEXT_PUBLIC_SITE_URL` - Public URL
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob

## Notes
- Language: Portuguese (pt-BR)
- Admin UI: dark theme, custom logo/icon
- Images: auto-resized (thumbnail 150px, small 300px, medium 768px, large 1024px)
- WhatsApp float button on all pages
- Google Analytics loaded via `GoogleAnalytics.tsx`
