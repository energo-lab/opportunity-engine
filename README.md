# ◆ Opportunity Discovery Engine

Motor pro objevování podnikatelských, investičních a technologických příležitostí. Využívá Claude API s web search pro živý průzkum trhů.

## Funkce

- **10 příležitostí** seřazených podle očekávané hodnoty (EV)
- **Výběr měsíce** — generuje nový průzkum pro každý měsíc 2026
- **Výběr lokality** — Svět + ČR nebo Svět + Austrálie
- **Detailní analýza** — neefektivity, monetizace, lokální relevance
- **Tooltips** — vysvětlivky všech metrik (EV, náročnost, kapitál, asymetrie)
- **Cache** — jednou vygenerované výsledky se ukládají

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Vercel Serverless Functions
- **AI:** Anthropic Claude Sonnet s web search
- **Hosting:** Vercel

## Struktura

```
opportunity-engine/
├── api/
│   └── generate.js          # Vercel serverless → Anthropic API
├── src/
│   ├── App.jsx               # Hlavní React komponenta
│   └── main.jsx              # Entry point
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

## Nasazení na Vercel

### 1. Push na GitHub

```bash
git init
git add .
git commit -m "init: opportunity discovery engine"
git remote add origin https://github.com/YOUR_USER/opportunity-engine.git
git push -u origin main
```

### 2. Import do Vercel

1. Jdi na [vercel.com/new](https://vercel.com/new)
2. Importuj svůj GitHub repozitář
3. Framework: **Vite**
4. Přidej environment variable:
   - `ANTHROPIC_API_KEY` = tvůj API klíč z [console.anthropic.com](https://console.anthropic.com/)
5. Klikni **Deploy**

### 3. Hotovo

Aplikace bude dostupná na `https://opportunity-engine.vercel.app` (nebo tvé vlastní doméně).

## Lokální vývoj

```bash
# Naklonuj repo
git clone https://github.com/YOUR_USER/opportunity-engine.git
cd opportunity-engine

# Nainstaluj závislosti
npm install

# Nastav API klíč
cp .env.example .env
# Uprav .env a vlož svůj ANTHROPIC_API_KEY

# Spusť s Vercel CLI (pro serverless funkce)
npx vercel dev

# Nebo jen frontend (bez API)
npm run dev
```

## Environment Variables

| Proměnná | Popis | Povinná |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | API klíč pro Claude | ✅ Ano |

## Licence

MIT

---

> ⚠️ **Disclaimer:** Toto není investiční poradenství. Slouží pouze k informačním účelům.
