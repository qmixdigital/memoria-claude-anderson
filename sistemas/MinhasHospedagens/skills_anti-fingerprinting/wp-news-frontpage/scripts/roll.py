#!/usr/bin/env python3
"""Generate a fingerprint roll for a new portal that diverges from its neighbors.

Reads data/fingerprint-rolls.json (append-only registry) and decides which
values to pick so the new roll differs in at least N critical variables from
each neighbor portal.

Usage:
    python scripts/roll.py --portal=novoportal.com.br [options]

Options:
    --portal=DOMAIN              required, the portal being generated
    --neighbors=A,B,C            comma-separated list of sibling domains
                                 (same VPS / same Cloudflare account / same niche)
    --vps=NAME                   VPS where this portal lives (auto-includes all
                                 portals on the same VPS as neighbors)
    --niche=STRING               niche tag (regional, saude, automotivo, etc.)
                                 (auto-includes portals with same niche)
    --theme=NAME                 parent theme (GeneratePress, Blocksy, Kadence)
    --archetype=A|B|C|D|E        force a specific front-page archetype
    --critical-divergence=N      minimum critical vars that must differ from
                                 each neighbor (default 5 of 7)
    --dry-run                    print roll but do not append to JSON
    --append                     append the roll to the JSON registry
                                 (only does this when explicitly asked)
    --output=FORMAT              json | header (default header)
                                 'header' is the PHP-comment block ready to
                                 paste at the top of front-page.php

Exit codes:
    0  success
    1  invalid arguments
    2  no neighbors found and divergence cannot be guaranteed
"""
import argparse
import datetime
import json
import os
import random
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "fingerprint-rolls.json"

# Variable matrix (must match references/*.md)
MATRIX = {
    # ---- front-page critical ----
    "archetype": ["A", "B", "C", "D", "E"],
    "class_naming": ["bem", "utility", "semantic", "prefixed", "mixed"],
    "sidebar": ["right", "left", "none", "dual", "floating"],
    "card_style": ["image_top", "image_left", "image_right", "overlay", "text_only", "mixed"],
    "hero_variant": ["single", "dual", "triptych", "slider", "grid", "boxed", "bleed"],
    "breaking_strip": ["ticker", "static_strip", "vertical_list", "tab_filter", "none"],
    "image_ratio": ["16x9", "4x3", "3x2", "1x1", "21x9", "mixed"],
    "adsense_set": ["none", "A", "B", "C"],

    # ---- single-post critical ----
    "single_archetype": ["I_classic", "II_longform", "III_tabloid", "IV_sidebar_rich"],
    "byline_position": ["under_title", "above_title", "floating_left", "inline_first_para", "hidden"],
    "related_posts_layout": ["grid_4", "grid_6", "vertical_list_5", "inline_3_during_content", "none"],
    "comments_treatment": ["wp_native", "lazy_native", "disqus", "facebook", "disabled"],
    "in_article_ad_pattern": ["none", "after_2nd_para", "every_3_paras", "every_5_paras", "auto_ads", "mid_only"],
    "featured_image_treatment": ["full_bleed", "boxed_max_width", "parallax", "cropped_aspect", "none"],
    "content_typography": ["news_compact", "news_comfortable", "editorial_large", "magazine_serif", "mono_minimal"],

    # ---- archive critical ----
    "archive_archetype": ["alpha_dense_list", "beta_magazine_grid", "gamma_editorial_column", "delta_hub_subcategories"],
    "posts_per_archive_page": ["8", "10", "12", "15", "20"],
    "archive_card_density": ["2_2_1", "3_2_1", "4_2_1", "4_3_2", "mixed_featured"],

    # ---- chrome critical ----
    "header_archetype": ["H1_classic_3row", "H2_single_row_compact", "H3_centered_split", "H4_sticky_megamenu", "H5_magazine_masthead"],
    "footer_archetype": ["F1_minimal", "F2_classic_4col", "F3_newsletter_featured", "F4_mega", "F5_sticky_bar"],
    "footer_credits_text": [
        "todos_direitos_reservados",
        "conteudo_independente",
        "publicacao_digital_desde_2020",
        "direito_informacao",
        "noticias_responsabilidade",
        "omit",
    ],

    # ---- visual identity critical ----
    "palette": [f"P{i:02d}" for i in range(1, 21)],
    "font_pairing": [f"F{i:02d}" for i in range(1, 21)],
    "spacing_scale": ["tight", "default", "comfortable", "spacious", "golden"],
    "border_radius": ["sharp", "subtle", "default", "friendly", "pill", "mixed"],
    "shadow_style": ["flat", "subtle", "editorial", "bold", "neumorphic"],

    # ---- structure secondary ----
    "permalink_structure": ["post_name", "category_post", "year_month_post", "category_year_post", "numeric_post", "archive_post"],
    "category_slug_style": ["pt_simple", "pt_descriptive", "pt_compound", "en_fallback", "mixed"],
    "menu_structure_style": ["categorical_first", "topical_hub", "flat_compact", "editorial_sections", "niche_focused"],
    "widgets_style": ["heavy", "minimal", "none", "dynamic", "custom_blocks"],
    "date_format": ["j_de_F_de_Y", "d_m_Y", "j_F_Y", "D_j_de_F", "relative", "iso_with_relative"],

    # ---- secondary (originals + new) ----
    "schema": ["itemlist", "collectionpage", "both", "webpage_only", "none"],
    "pagination": ["numbered", "prev_next", "load_more", "infinite", "none"],
    "posts_per_category": ["4", "5", "7", "8", "9"],
    "excerpt": ["none", "short", "medium", "long", "mixed"],
    "meta_visibility": ["date_only", "date_category", "date_author_category", "category_readtime", "all", "minimal"],
    "wrapper_semantics": ["section", "article", "div_role_region", "aside_mix"],
    "heading_hierarchy": ["h2_categories", "h3_categories", "h1_logo", "p_logo"],
    "php_comments": ["phpdoc", "inline", "hash", "none", "verbose_phpdoc"],
    "indentation": ["tabs", "two_space", "four_space"],
    "function_naming": ["wp_native", "custom_helpers", "inline_only"],
    "font_strategy": ["system_only", "self_hosted_single", "self_hosted_variable", "google_preconnected"],
    "share_buttons_position": ["top_only", "bottom_only", "top_and_bottom", "floating_left_sticky", "floating_right_sticky", "inline_after_first_para", "none"],
    "breadcrumb_style": ["text_arrows", "text_slashes", "text_pipes", "chevron_icons", "none"],
    "menu_position_in_header": ["above_logo", "below_logo", "right_of_logo", "split_around_logo", "hidden_burger"],
    "header_search_treatment": ["visible_input_box", "icon_modal_on_click", "icon_inline_dropdown", "none"],
    "header_sticky_behavior": ["always_sticky", "sticky_on_scroll_up", "sticky_after_scroll_300px", "not_sticky"],
    "social_icons_position": ["top_right_header", "bottom_left_footer", "floating_left_sidebar", "inline_in_post_meta", "none"],
    "post_meta_visibility": ["minimal", "classic", "tech_blog", "news_full", "engagement", "none"],
    "author_bio_box": ["compact", "expanded", "card_style", "none"],
    "archive_pagination": ["numbered_top_bottom", "numbered_bottom", "prev_next_only", "load_more_button", "infinite_scroll"],
    "category_description_position": ["top_subtitle", "top_inside_box", "sidebar_only", "none"],
    "subcategory_strip_treatment": ["pills", "tabs", "dropdown", "breadcrumb_chain", "boxed_grid"],
    "archive_h1_treatment": ["h1_only", "h1_with_count", "h1_with_description", "h1_with_featured_post"],
    "link_underline_style": ["always", "hover_only", "never", "dotted", "animated"],
    "button_style": ["filled", "outlined", "ghost", "link_only", "gradient"],
    "dark_mode_support": ["none", "manual_toggle", "auto_prefers"],
    "menu_separator_style": ["pipes", "bullets", "slashes", "chevrons", "none_just_spacing"],
    "menu_item_capitalization": ["title_case", "sentence_case", "all_caps", "lowercase"],
}

CRITICAL = {
    "class_naming", "sidebar", "card_style", "hero_variant",
    "breaking_strip", "image_ratio", "adsense_set",
    "single_archetype", "byline_position", "related_posts_layout",
    "comments_treatment", "in_article_ad_pattern", "featured_image_treatment",
    "content_typography", "archive_archetype", "posts_per_archive_page",
    "archive_card_density", "header_archetype", "footer_archetype",
    "footer_credits_text", "palette", "font_pairing",
    "spacing_scale", "border_radius", "shadow_style",
}


def load_db():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"{DB_PATH} not found. Initialize the registry first.")
    with DB_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def save_db(db):
    with DB_PATH.open("w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def find_neighbors(db, args):
    rolls = db.get("rolls", [])
    explicit = set(d.strip() for d in (args.neighbors or "").split(",") if d.strip())
    out = []
    for r in rolls:
        if r["portal"] == args.portal:
            continue
        if r["portal"] in explicit:
            out.append(r); continue
        if args.vps and r.get("vps") == args.vps:
            out.append(r); continue
        if args.niche and r.get("niche") == args.niche:
            out.append(r); continue
    return out


def saturated_values(neighbors, var):
    return Counter(n["roll"].get(var) for n in neighbors if n["roll"].get(var))


def pick_value(var, neighbors):
    options = list(MATRIX[var])
    counts = saturated_values(neighbors, var)
    if not counts:
        return random.choice(options)
    options.sort(key=lambda v: (counts.get(v, 0), random.random()))
    return options[0]


def divergence_count(roll_a, roll_b, vars_subset):
    return sum(1 for v in vars_subset if roll_a.get(v) != roll_b.get(v))


def generate_roll(args):
    db = load_db()
    neighbors = find_neighbors(db, args)

    roll = {}
    if args.archetype:
        roll["archetype"] = args.archetype.upper()

    var_order = list(CRITICAL) + [v for v in MATRIX.keys() if v not in CRITICAL]
    for var in var_order:
        if var in roll:
            continue
        roll[var] = pick_value(var, neighbors)

    needed = args.critical_divergence
    weak = [n for n in neighbors if divergence_count(roll, n["roll"], CRITICAL) < needed]
    attempts = 0
    while weak and attempts < 80:
        for n in weak:
            for var in CRITICAL:
                if roll[var] == n["roll"].get(var):
                    new_options = [o for o in MATRIX[var] if o != roll[var]]
                    if new_options:
                        roll[var] = random.choice(new_options)
        weak = [n for n in neighbors if divergence_count(roll, n["roll"], CRITICAL) < needed]
        attempts += 1

    return roll, neighbors, weak


def output_header(portal, theme, archetype, roll, neighbors_count, excluded_langs=None):
    today = datetime.date.today().isoformat()
    pad = max(len(k) for k in roll)
    lines = [
        "<?php",
        "/**",
        f" * Portal: {portal}",
    ]
    if theme:
        lines.append(f" * Parent theme: {theme}")
    lines.append(f" * Front-page archetype: {roll.get('archetype', archetype or '?')}")
    lines.append(" * Fingerprint roll:")
    for k, v in roll.items():
        if k == "archetype":
            continue
        lines.append(f" *   {k.ljust(pad)}: {v}")
    if excluded_langs:
        lines.append(f" * Excluded lang categories (home only): {', '.join(excluded_langs)}")
    lines.append(f" * Neighbors considered: {neighbors_count}")
    lines.append(f" * Generated: {today}")
    lines.append(" */")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--portal", required=True)
    ap.add_argument("--neighbors", default="")
    ap.add_argument("--vps", default=None)
    ap.add_argument("--niche", default=None)
    ap.add_argument("--theme", default=None,
                    choices=["GeneratePress", "Blocksy", "Kadence", "Astra", "OceanWP", "Neve", "SmartMag"])
    ap.add_argument("--archetype", default=None, choices=list("ABCDE"))
    ap.add_argument("--critical-divergence", type=int, default=18)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--append", action="store_true")
    ap.add_argument("--output", default="header", choices=["json", "header"])
    ap.add_argument("--exclude-lang-categories", default="",
                    help="Comma-separated category slugs to exclude from the home "
                         "page (multi-language portals). Example: pt-pt,en-us")
    args = ap.parse_args()

    roll, neighbors, weak = generate_roll(args)

    if weak:
        print(f"WARNING: could not guarantee {args.critical_divergence}-critical "
              f"divergence from {len(weak)} neighbor(s):", file=sys.stderr)
        for n in weak:
            d = divergence_count(roll, n["roll"], CRITICAL)
            print(f"  - {n['portal']} (only {d}/{len(CRITICAL)} criticals differ)",
                  file=sys.stderr)

    excluded_langs = [s.strip() for s in args.exclude_lang_categories.split(",") if s.strip()]

    entry = {
        "portal": args.portal,
        "theme": args.theme,
        "vps": args.vps,
        "niche": args.niche,
        "neighbors": [n["portal"] for n in neighbors],
        "generated_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "excluded_lang_categories": excluded_langs,
        "roll": roll,
    }

    if args.output == "json":
        print(json.dumps(entry, indent=2, ensure_ascii=False))
    else:
        print(output_header(args.portal, args.theme, args.archetype,
                            roll, len(neighbors), excluded_langs))

    if args.append and not args.dry_run:
        db = load_db()
        db["rolls"].append(entry)
        save_db(db)
        print(f"\n# Appended to {DB_PATH.relative_to(ROOT)}", file=sys.stderr)
    elif args.dry_run:
        print("\n# DRY RUN - registry not modified", file=sys.stderr)
    else:
        print(f"\n# Roll generated but NOT appended. Use --append to record it.",
              file=sys.stderr)


if __name__ == "__main__":
    main()
