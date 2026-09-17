# AdSense Placement Patterns

Three placement sets (A, B, C) to rotate across sibling portals. Mixing slot sets across the network reduces ad-density fingerprint and helps individual portals avoid AdSense policy strikes that often hit groups of similar sites simultaneously.

## Universal rules across all sets

1. **Reserve space.** Every ad container has `min-height` set to prevent CLS. See `performance.md`.
2. **Lazy-load below-fold ads** using AdSense's native lazy load setting plus `loading="lazy"` on the slot container's iframe (when possible).
3. **No more than 3 ads above the fold.** Anything more is policy risk.
4. **Mobile and desktop slots are separate.** Use responsive AdSense units, but consider hiding certain slots via CSS on mobile if density gets too high.
5. **Never place ads adjacent to navigation** (above-menu sticky bars). Policy violation.
6. **Always disclose ads.** A small "Publicidade" label above each slot. Brazilian readers expect this and Google rewards transparency.

## Set A: Top-heavy editorial

Higher RPM but lower page count tolerance. Best for portals with high session duration (regional news, niche).

| Position | Slot |
|---|---|
| Below header, above hero | Leaderboard 728x90 desktop, 320x100 mobile |
| Right sidebar (sticky) | Half-page 300x600 desktop, none on mobile |
| In-feed after 4th post | Native in-feed |
| Above footer | Leaderboard 728x90 desktop, 320x100 mobile |

Total slots above fold (mobile): 1
Total slots above fold (desktop): 2

```php
// Set A example, slot 1 (below header)
echo '<div class="ad-slot ad-slot--leaderboard">';
echo '<span class="ad-label">Publicidade</span>';
echo '<ins class="adsbygoogle" 
            style="display:block; min-height:90px;" 
            data-ad-client="ca-pub-XXXXXXXXXXXX" 
            data-ad-slot="YYYYYYYYYY"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>';
echo '</div>';
```

## Set B: Distributed in-feed

Better for AdSense-heavy aggregator portals. Spreads ads through the feed instead of stacking at the top.

| Position | Slot |
|---|---|
| Right sidebar (top, sticky) | Medium rectangle 300x250 |
| In-feed after 3rd post | Native in-feed |
| In-feed after 7th post | Native in-feed |
| In-feed after 12th post | Native in-feed |
| Right sidebar (bottom) | Medium rectangle 300x250 |

Total slots above fold (mobile): 1 (sidebar moves below content)
Total slots above fold (desktop): 1

Best paired with Archetype C (Grid Aggregator) and Archetype D (Feature-Led Stream).

## Set C: Minimal, premium feel

Lower ad density, better UX, lower RPM but better long-term retention. Use for editorial-focused portals (Archetype B).

| Position | Slot |
|---|---|
| In-feed after hero | Native in-feed (single) |
| Above footer | Leaderboard 728x90 desktop, 320x100 mobile |

Total slots above fold (mobile): 0
Total slots above fold (desktop): 1

Pairs well with newsletter signup or "supported by readers" framing.

## In-feed implementation pattern

In-feed ads should look like content cards, not banners. Use AdSense's native in-feed unit with custom CSS to match the card style of the surrounding feed.

```php
// Inside the main feed loop
$post_count = 0;
while ( $query->have_posts() ) :
    $query->the_post();
    $post_count++;

    // Render the post card
    get_template_part( 'template-parts/card' );

    // Inject ad after Nth post
    if ( $post_count === 4 || $post_count === 8 ) :
        ?>
        <div class="ad-slot ad-slot--in-feed">
            <span class="ad-label">Publicidade</span>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-format="fluid"
                 data-ad-layout-key="-XX-XX+YY+ZZ"
                 data-ad-client="ca-pub-XXXXXXXXXXXX"
                 data-ad-slot="YYYYYYYYYY"></ins>
        </div>
        <?php
    endif;
endwhile;
wp_reset_postdata();
```

The `data-ad-layout-key` value is generated in the AdSense dashboard when creating an in-feed ad unit. Each portal should have its own native ad unit so the layout key differs across the network.

## Sidebar sticky pattern

For sets A and B, the sidebar ad sticks as the user scrolls. Use `position: sticky` (CSS-only, no JS).

```css
.sidebar-ad-sticky {
    position: sticky;
    top: 80px; /* offset for fixed header if any */
    align-self: flex-start; /* important when parent is flex */
}
```

The container must have a fixed min-height to prevent layout shift when the ad loads.

## Loading the AdSense script

Load once, in the `<head>`, with `async`:

```php
add_action( 'wp_head', function() {
    ?>
    <script async src="https://pagead2.googleusercontent.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
            crossorigin="anonymous"></script>
    <?php
}, 5 );
```

Each `<ins>` tag is initialized with:

```html
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

Place this immediately after each `<ins>` tag, not in a separate file.

## Per-portal ad client

Each portal in the network has its own `ca-pub-XXXXXXXXXXXX` client ID and its own ad slot IDs. Never copy slot IDs between portals. This is both a fingerprint risk and a revenue tracking issue.

When generating a new front-page, leave the client and slot IDs as placeholders (`ca-pub-PORTAL_PUB_ID`, `data-ad-slot="PORTAL_SLOT_LEADERBOARD_HEADER"`) for the operator to fill in. Do not invent IDs.

## When to omit AdSense entirely

- New portals before AdSense approval (do not run ads yet).
- Portals primarily used as link-building infrastructure where ad revenue is incidental.
- Portals in niches with thin AdSense inventory (some local Brazilian niches).

For these, generate the front-page with no `ad-slot` divs at all. Adding empty containers "for later" is itself a fingerprint.

## Anti-fingerprint reminders for ads

Across sibling portals:

- Vary which slot set is used (A, B, or C).
- Vary the CSS class names on ad containers (`ad-slot`, `anuncio`, `publicidade-block`, `sponsor-area`).
- Vary the "Publicidade" label text (`Publicidade`, `Anúncio`, `Patrocinado`, `Conteúdo Patrocinado`, or omit).
- Vary the order of in-feed ad insertions (after 3rd, 4th, or 5th post).
- Different portals can use different ad sizes (some 300x250 sidebar, some 336x280, some half-page).

These small variations across the network make automated similarity detection harder.
