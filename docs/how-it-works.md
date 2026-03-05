---
title: How It Works
nav_order: 6
---

# How It Works

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐
│  RSS Feeds  │────▶│ Filter & De- │────▶│  Gemini AI   │────▶│  Email /  │
│  + Google   │     │  duplicate   │     │  Risk Check  │     │  Telegram │
│    News     │     │              │     │              │     │           │
└─────────────┘     └──────────────┘     └──────────────┘     └───────────┘
                          │                                         │
                    ┌─────▼─────┐                                   │
                    │cache.json │◀──────────────────────────────────┘
                    └───────────┘
```

## Pipeline

The main entry point (`src/index.ts`) orchestrates this flow:

1. **Load cache** — Read `cache.json` with previously seen article IDs
2. **Fetch articles** — Pull RSS feeds + Google News, filter by `WATCH_KEYWORDS`
3. **Deduplicate** — Remove articles already in cache (matched by MD5 hash of URL)
4. **AI analysis** — Send new headlines to Gemini for risk assessment
5. **Update cache** — Save all seen article IDs (keeps last 500)
6. **Alert** — If risk is `medium` or above, send email and Telegram notification

## Source Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry — orchestrates the pipeline |
| `src/feeds.ts` | Fetches 5 RSS feeds, filters by keywords, deduplicates via MD5 |
| `src/analyze.ts` | Sends headlines to Gemini 2.5 Flash Lite, parses JSON risk response |
| `src/notify.ts` | Builds color-coded HTML email, sends via Resend |
| `src/telegram.ts` | Sends Telegram alerts via Bot API (native fetch, no dependencies) |
| `src/cache.ts` | JSON file cache of seen article IDs |
| `src/types.ts` | TypeScript interfaces: `Article`, `RiskLevel`, `RiskResult`, `Cache` |

## AI Risk Analysis

Headlines are sent to Gemini with a structured prompt that returns JSON:

```json
{
  "risk_level": "medium",
  "summary": "Regulatory scrutiny in the UAE could impact exchange operations.",
  "alerts": ["UAE enters high alert with Binance and Bybit top brass told to stay home"]
}
```

The model evaluates headlines against risk criteria:

- **Critical** — insolvency, confirmed hack, withdrawal freeze, bankruptcy
- **High** — security breach, regulatory enforcement, suspected bank run
- **Medium** — regulatory warning, partnership failure, leadership departure
- **Low** — minor negative press, market downturn coverage
- **None** — neutral or positive news

If the AI response can't be parsed, the system falls back to `low` risk and flags for manual review.

## Deduplication

Each article is identified by an MD5 hash of its URL. The cache stores up to 500 IDs and prunes older entries automatically. This prevents the same article from triggering repeated alerts across runs.
