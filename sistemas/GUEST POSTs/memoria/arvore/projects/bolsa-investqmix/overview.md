---
name: overview
description: InvestQMIX Brazilian stock market platform, purpose, stack, implemented modules, current state, and next steps
sources: [backfill]
aliases: [InvestQMIX, QMIX Digital]
---

## Purpose and context

- [stated] Anderson works in marketing and is building InvestQMIX, a Brazilian stock market platform co-developed with Claude Code (VS Code)
- [stated] The platform focuses on tax optimization, portfolio tracking, and trading simulation for the Brazilian market (B3)
- [stated] Anderson is a self-described layman in finance
- [stated] Standing memory instruction: do not retain stock market holdings, positions, or investment analysis in memory, only QMIX Digital / InvestQMIX platform content should be memorized

## Stack and infrastructure

- [stated] TypeScript, decimal.js, pg-boss (job scheduler), grammY (Telegram bot), PostgreSQL, Docker on a Hostinger VPS
- [stated] Dev environment: Claude Code (VS Code), Docker, Hostinger VPS
- [stated] Data sources: brapi.dev, Yahoo Finance (`.SA` suffix), B3 Cotahist historical files
- [stated] Tax filing: SicalcWeb (sicalc.receita.economia.gov.br) for DARF generation
- [stated] Brokerage / portfolio tracking: C6 Bank (brokerage), Investidor10 (portfolio platform)

## Current state, active and deployed

- [stated] InvestQMIX is an active, deployed system
- [stated] Fiscal/IR module fully implemented and tested (47 tests passing at last check)
- [stated] Fiscal module covers: R$20k monthly gross-sale exemption threshold for swing trades; day trade vs. swing trade segregation (20% vs. 15% IR); loss carryforward rules; withholding tax as abatable credit; DARF due-date calculation using the B3 business-day calendar; fee treatment in cost basis (purchase fees enter average price, sale fees reduce proceeds); asset-class separation (FIIs taxed at 20% with no exemption, ETFs/BDRs excluded from the R$20k threshold); corporate events table (split/grupamento/ajuste) to preserve cost basis integrity
- [stated] Telegram alerts live: daily opportunity alerts (3 conditions, position in profit, margin available, cost viability), month-end summaries (vale a pena / adiar / não compensa), DARF reminders, ex-dividend date conflict detection, `/ajuda` glossary command
- [stated] Telegram outputs use plain language with parenthetical glossary terms for non-specialist readability
- [stated] Paper trading / simulation module is in design/early development phase, intended to enable investment simulation and market study without real money, within InvestQMIX

## Current state, on the horizon

- [stated] Next planned step: paper trading schema design, `paper_orders` / `paper_positions` tables and a Cotahist backtest loop
- [stated] Recommended simulation roadmap sequence: Cotahist historical backtest, live paper trading with brapi.dev, AI agent layer via Anthropic API with pg-boss jobs at key market hours
- [stated] InvestQMIX does not currently handle options (covered calls / venda coberta); flagged as a future gap if Anderson pursues that strategy
- [stated] A tracking spreadsheet for covered call paper trading (openpyxl-based with IR calculations) was offered but not yet confirmed as built
