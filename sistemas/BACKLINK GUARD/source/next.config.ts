import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a TODAS as respostas (defesa em profundidade
// — não depende só do Cloudflare). Ferramenta interna: bloqueia enquadramento
// (clickjacking), sniffing de tipo, vazamento de referer e indexação por buscadores.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
