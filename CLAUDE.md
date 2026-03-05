# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crypto Sentinel is an AI-powered crypto news monitor for YouHodler and Bybit. It fetches RSS feeds, filters by keywords, analyzes risk via Google Gemini, and emails alerts via Resend. Runs as a scheduled GitHub Actions job (4x/day), not a server.

## Commands

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript → dist/
npm start          # Run compiled version (requires build)
npm run dev        # Run directly with ts-node (development)
```

No test framework is configured. The `npm run lint` script references ESLint but no ESLint config exists.

## Environment Variables

Required in `.env` (see `.env.example`):
- `GEMINI_API_KEY` — Google AI Studio
- `RESEND_API_KEY` — Resend email service
- `ALERT_EMAIL` — Recipient email
- `FROM_EMAIL` — Sender email (verified in Resend)

## Architecture

All source files live in `src/`. Compiled output goes to `dist/`.

**Pipeline flow (src/index.ts orchestrates):**

```
loadCache() → fetchArticles() → filter unseen → analyzeRisk() → saveCache() → sendAlert()
```

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry — orchestrates the pipeline |
| `src/feeds.ts` | Fetches 5 RSS feeds (CoinTelegraph, Decrypt, TheBlock, CryptoSlate, Google News), filters by keywords, deduplicates via MD5 hash of URL |
| `src/analyze.ts` | Sends headlines to Gemini 2.0 Flash, expects structured JSON risk assessment |
| `src/notify.ts` | Builds rich HTML email with color-coded risk levels, sends via Resend |
| `src/cache.ts` | JSON file-based cache of seen article IDs (keeps last 500) |
| `src/types.ts` | Core types: `Article`, `RiskLevel`, `RiskResult`, `Cache` |

**Key design decisions:**
- Stateless except for `cache.json` (committed back by GitHub Actions)
- Risk levels: `none | low | medium | high | critical` — only `medium`+ triggers email
- Articles are identified by MD5 hash of their URL to prevent re-processing

## Deployment

`.github/workflows/monitor.yml` defines the GitHub Actions workflow. Runs on schedule (`0 23,5,9,15 * * *` UTC) and manual dispatch. Requires repo secrets matching the env vars above. After each run, it commits `cache.json` changes back to the repo.

## TypeScript Config

- Target: ES2022, Module: CommonJS
- Strict mode enabled
- Output: `dist/`
- JSON module resolution enabled
