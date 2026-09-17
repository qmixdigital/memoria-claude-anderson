# Layout Archetypes

Five structural archetypes for news portal homepages. Pick one per portal and rotate across the network. The archetype defines the macro-structure (which sections appear and in what order). The fingerprint variables (in `fingerprint-vars.md`) define the micro-style within that structure.

## Archetype A: Classic Newspaper

Inspired by traditional Brazilian news portals (G1, UOL old layout). Dense, content-heavy, multiple visible category blocks.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|         BREAKING NEWS STRIP               |
+-----------------------+-------------------+
|                       |                   |
|     HERO (single)     |   MOST READ       |
|                       |                   |
+-----------------------+   (sidebar top)   |
|   POLITICA (4 posts)  |                   |
+-----------------------+   NEWSLETTER      |
|   ECONOMIA (4 posts)  |                   |
+-----------------------+   AD SLOT         |
|   ESPORTES (4 posts)  |                   |
+-----------------------+-------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Strengths:** Familiar to Brazilian readers, lots of crawlable content, easy to monetize.
**Weaknesses:** Slower LCP if hero image is large, dense DOM.
**Best for:** General news, regional portals, portals with mature post archives (1000+ posts).

## Archetype B: Magazine Feature

Editorial-driven, fewer posts shown but with more visual weight per post. Inspired by The Atlantic, Vox.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|                                           |
|         FULL-BLEED HERO (single)          |
|         large image, overlay title        |
|                                           |
+-------------------------------------------+
|   FEATURE 1   |   FEATURE 2   | FEATURE 3 |
+-------------------------------------------+
|         "MAIS LIDAS" HORIZONTAL LIST       |
+-------------------------------------------+
|       LATEST FEED (single column, 8 posts) |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Strengths:** Strong visual identity, fast LCP if hero is well-optimized.
**Weaknesses:** Less crawlable surface area, fewer ad slots above fold.
**Best for:** Niche portals (saude, automotivo), opinion-focused sites, smaller archives.

## Archetype C: Grid Aggregator

Reddit-style or Drudge-style. Pure feed of cards, minimal hierarchy. Strong for SEO crawlability and AdSense density.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|         CATEGORY TAB FILTER               |
+-------------------------------------------+
|  CARD  |  CARD  |  CARD  |  CARD          |
+--------+--------+--------+--------+
|  CARD  |  AD    |  CARD  |  CARD          |
+--------+--------+--------+--------+
|  CARD  |  CARD  |  CARD  |  CARD          |
+-------------------------------------------+
|       LOAD MORE BUTTON / INFINITE         |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Strengths:** Maximum post visibility, easy AdSense in-feed, fast to scan.
**Weaknesses:** No editorial hierarchy, can feel low-quality if posts are weak.
**Best for:** High-volume portals, automotive (consultaplacabrasil-style), aggregator-feel niches.

## Archetype D: Feature-Led Stream

Hybrid. One strong hero, then a vertical river of medium cards. Modern, mobile-first.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|         HERO (dual or triptych)           |
+-------------------------------------------+
|   POST CARD (image left, full row)        |
+-------------------------------------------+
|   POST CARD (image right, full row)       |
+-------------------------------------------+
|   AD SLOT (in-feed)                       |
+-------------------------------------------+
|   POST CARD (image left, full row)        |
+-------------------------------------------+
|   POST CARD (image right, full row)       |
+-------------------------------------------+
|   "MAIS LIDAS" SECTION                    |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Strengths:** Mobile-friendly (cards stack naturally), strong scroll engagement.
**Weaknesses:** Limited categories visible, less newspaper-feel.
**Best for:** Mobile-heavy traffic portals, blog-style niches, regional with limited content.

## Archetype E: Topical Hub

Category-first instead of post-first. The homepage is a directory of topic clusters, each with 2 to 3 representative posts. Strong for topical authority signals.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|       INTRO BLOCK (1 paragraph + CTA)     |
+-------------------------------------------+
|  TOPIC CLUSTER 1   |   TOPIC CLUSTER 2    |
|  3 posts + link    |   3 posts + link     |
+-------------------------------------------+
|  TOPIC CLUSTER 3   |   TOPIC CLUSTER 4    |
|  3 posts + link    |   3 posts + link     |
+-------------------------------------------+
|       FEATURED CATEGORY (full width)      |
|       6 posts in grid                     |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Strengths:** Strong internal linking, builds topical authority, good for thin niches.
**Weaknesses:** Less "news feel", harder to populate if categories are uneven.
**Best for:** Directory-style portals (clinicasrecuperacaosaopaulo, distribuidorasdealimentos), niche portals with clear topic taxonomy.

## Selection guide

When the user does not specify, ask about traffic source and content volume, then pick:

- High volume + general news: A
- Editorial focus + small archive: B
- Aggregator + AdSense-heavy: C
- Mobile-first + medium archive: D
- Niche + topical authority play: E

For sibling portals on the same infrastructure, force different archetypes. If 5 portals are built in a session, use each archetype exactly once.

## What varies inside an archetype

The archetype is the skeleton. The fingerprint roll changes the skin. Two portals using Archetype A should still look different because:

- Class naming convention differs
- Card style inside category blocks differs (image_top vs image_left)
- Image aspect ratio differs
- Sidebar contents differ (Most Read vs Newsletter on top)
- Heading hierarchy differs

This means you can have multiple Archetype A portals in the network without obvious duplication, as long as the rolls differ aggressively.
