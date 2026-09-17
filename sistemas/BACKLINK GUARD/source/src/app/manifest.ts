import type { MetadataRoute } from "next";

// Web App Manifest — ícones Android/PWA, cores e nome. Next serve em
// /manifest.webmanifest e injeta <link rel="manifest"> automaticamente.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BacklinkGuard — QMIX",
    short_name: "BacklinkGuard",
    description:
      "Monitoramento de backlinks: artigo publicado, link do cliente e indexação no Google.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#059669",
    icons: [
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
