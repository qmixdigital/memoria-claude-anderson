---
name: domain-learnings
description: B3 tax rules, simulation realism constraints, and data-source knowledge underpinning InvestQMIX, read before touching fiscal or simulation logic
sources: [backfill]
aliases: []
---

## Brazilian tax rules (B3)

- [stated] The R$20k monthly exemption applies to gross sales, not profit; it survives MP 1303/2025 (which lapsed October 2025)
- [stated] Loss carryforward only works between taxable operations of the same asset class, ações and FIIs are separate buckets
- [stated] Losses in exempt months cannot be used to offset taxable gains
- [stated] Option premiums (covered calls) are not exempt under the R$20k monthly rule, taxed differently from stock sales

## Data integrity

- [stated] Corporate events (splits, grupamentos) break manual buy/sell cost basis ledgers, requires a dedicated events table

## Simulation realism

- [stated] Realistic B3 simulation must account for B3 fees, slippage, pregão hours, and IR rules
- [stated] Reference videos on trading strategies often contain commercial distortions or omit structural risks
- [stated] Free data sources for simulation: brapi.dev, Yahoo Finance (`.SA` suffix), B3 Cotahist historical files
