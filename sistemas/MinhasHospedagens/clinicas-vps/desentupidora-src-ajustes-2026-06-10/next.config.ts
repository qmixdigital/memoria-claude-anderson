import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // URLs exatamente iguais ao WordPress antigo: /<slug>/ com barra no fim.
  // Sem isso, links indexados pelo Google batem em redirect 308.
  trailingSlash: true,

  // Tree-shaking agressivo para bibliotecas com barrel exports grandes.
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react", "@tiptap/starter-kit"],
  },

  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        // QMix WP-compatível: integração de notícias (único tipo usado neste portal)
        source: "/wp-json/sistema-qmix/v1/artigos",
        destination: "/api/qmix/noticias",
      },
    ]
  },

  async redirects() {
    // URL canônica = permalink WP legado: /<slug>/.
    // /artigos/ é a página magazine (índice editorial). Slugs de artigo individuais
    // continuam canônicos em /<slug>/ — redirecionamos /artigos/<slug>/ pra preservar isso.
    return [
      { source: "/artigos/:slug",   destination: "/:slug",     permanent: true },
      { source: "/noticias/:slug",  destination: "/:slug",     permanent: true },

      // /category/<slug> (inglês — WP padrão original) → /categoria/<slug> (PT-BR)
      { source: "/category",        destination: "/noticias",          permanent: true },
      { source: "/category/:slug",  destination: "/categoria/:slug",   permanent: true },
    ]
  },

  async headers() {
    const isStaging =
      (process.env.NEXT_PUBLIC_DOMAIN ?? "").startsWith("staging.") ||
      process.env.STAGING === "1"

    const baseHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ]

    if (isStaging) {
      baseHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" })
    }

    return [
      {
        source: "/:path*",
        headers: baseHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
};

export default nextConfig;
