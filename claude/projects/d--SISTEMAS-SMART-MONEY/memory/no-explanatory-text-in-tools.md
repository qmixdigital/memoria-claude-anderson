---
name: Sem textos explicativos em ferramentas
description: User odeia textos longos em ferramentas funcionais — quer só dados. Explicações vão no chat, não no UI.
type: feedback
originSessionId: 17875b33-1111-46e2-b234-32a7657ef8f0
---
User odeia textos explicativos em ferramentas. Frase exata: "Eu vou ler uma vez e nunca mais vou ler, então é desnecessário esses textos."

**Why:** ferramentas que ele usa diariamente devem ser densas em dados. Explicações de uso, metodologia, disclaimers, "como seguir investidores famosos", "por que essa lista é diferente" — tudo isso ocupa espaço e não agrega após a primeira leitura.

**How to apply:**
- Quando o user perguntar como uma feature funciona, **explicar no chat, não no UI**
- Não adicionar `<details>`/`<summary>` com explicações longas em páginas operacionais (/oportunidades, /watchlist, /screener, /funds, /proventos)
- Tooltips curtos via `title=""` em ícones específicos: ✅ aceitável (não consomem espaço)
- Disclaimers legais minimalistas: aceitável se em footer pequeno, não ocupando área principal
- Subtítulo de h1 com 1 linha curta: aceitável (orienta sem chatear)
- Anti-pattern: bloco amarelo "⚠️ Esta página NÃO é recomendação", `<details open>` "💡 Por que essa lista é diferente"
