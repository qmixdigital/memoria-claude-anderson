---
name: overview
description: Portuguese SEO title generation, purpose, the 60 to 65 character standard, workflow, and current state
sources: [backfill]
aliases: ["qual é o melhor", "SEO titles", "Portuguese blog titles"]
---

## Purpose & context

- [stated] Anderson runs an SEO content operation focused on Portuguese-language blog posts.
- [stated] Two main content verticals: the "qual é o melhor" (which is the best) product/comparison niche, and dream interpretation content with spiritual dimensions.
- [stated] The core objective is producing optimized blog post titles that meet strict SEO character count standards.
- [stated] Success means every title falls within the 60 to 65 character range, no exceptions.

## The character standard

- [stated] The 60 to 65 character range is non-negotiable. Titles outside this range are not acceptable.
- [stated] If no complement from the current table fits, the complement table must be expanded to cover all keyword lengths, the title is never left incomplete or out of range.
- [stated] Complement selection follows a longest-to-shortest algorithm: pick the longest complement that brings the total into the 60 to 65 range, maximizing descriptive value while staying within limits.
- [stated] Short keywords require long complements. When base keywords are under ~25 characters, the complement table must include options long enough (up to ~47 characters) to bridge the gap into the target range.

## Formatting standards

- [stated] Correct capitalization of proper nouns and brands is part of the standard (e.g., Brasil, iPhone, WinRAR, Jesus).
- [stated] Accent corrections are applied (e.g., álcool, ômega, câncer).
- [stated] Punctuation is kept consistent across titles.

## Approach & workflow

- [stated] Anderson submits raw keyword lists in Portuguese; Claude processes them in bulk.
- [stated] A Python-based character-counting methodology is used to pair each keyword with the appropriate complement tier.
- [stated] Complement tables are tiered by character length and selected in descending order to maximize title richness within the character constraint.
- [stated] Anderson reviews output and flags issues directly (e.g., titles not meeting size standards), prompting iterative refinement of the complement table or logic.

## Tools & resources

- [stated] Python-based character counting and complement-matching logic.
- [stated] Tiered Portuguese complement libraries tailored per content vertical, dream interpretation complements differ from product comparison complements.

## Current state

- [stated] Actively processing batches of raw Portuguese keywords and converting them into SEO-optimized titles.
- [stated] Recent work has covered both verticals: product/comparison content and dream interpretation content.
- [stated] Batches have ranged from 27 to 62 keywords per session.
