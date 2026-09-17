---
name: google-news-discovery
description: Autonomous news pipeline (Google News Discovery motor), separate from Sistema Antônio, deployed on Hetzner
sources: [backfill]
aliases: [Google News Discovery motor]
---
- [stated] Autonomous news pipeline, separate from Sistema Antônio, deployed on a dedicated Hetzner CX32 server
- [stated] Collects Google News RSS, decodes links, extracts text via Trafilatura, deduplicates, generates articles via Claude Sonnet 5 Batch API, publishes to Portal Engine and WordPress receptors across 17 pilot portals
- [stated] Called "Google News Discovery"; its own folder is already created and active in VS Code
- [stated] Built and deployed in the same working session as the euvo.com.br events agenda
