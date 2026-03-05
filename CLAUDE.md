# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crypto Sentinel is an AI-powered crypto news monitor. It fetches RSS feeds, filters by configurable keywords, analyzes risk via Google Gemini, and sends alerts via email (Resend) and Telegram. Runs as a scheduled GitHub Actions job (4x/day), not a server.

## Commands

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript → dist/
npm start          # Run compiled version (requires build)
npm run dev        # Run directly with ts-node (development)
```

No test framework is configured.

## Environment Variables

Required in `.env` (see `.env.example`):
- `GEMINI_API_KEY` — Google AI Studio
- `RESEND_API_KEY` — Resend email service
- `RECIPIENT_EMAIL` — where to receive email alerts
- `WATCH_KEYWORDS` — comma-separated keywords to monitor (default: `bybit,youhodler`)

Optional:
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `TELEGRAM_CHAT_ID` — from @userinfobot

## Architecture

All source files live in `src/`. Compiled output goes to `dist/`.

**Pipeline flow (src/index.ts orchestrates):**

```
loadCache() → fetchArticles() → filter unseen → analyzeRisk() → saveCache() → sendAlert() → sendTelegramAlert()
```

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry — orchestrates the pipeline |
| `src/feeds.ts` | Fetches 5 RSS feeds (CoinTelegraph, Decrypt, TheBlock, CryptoSlate, Google News), filters by WATCH_KEYWORDS, deduplicates via MD5 hash of URL |
| `src/analyze.ts` | Sends headlines to Gemini 2.5 Flash, expects structured JSON risk assessment |
| `src/notify.ts` | Builds rich HTML email with color-coded risk levels, sends via Resend from `Crypto Sentinel <onboarding@resend.dev>` |
| `src/telegram.ts` | Sends Telegram alerts via Bot API (native fetch, no npm deps). Gracefully skips if not configured |
| `src/cache.ts` | JSON file-based cache of seen article IDs (keeps last 500) |
| `src/types.ts` | Core types: `Article`, `RiskLevel`, `RiskResult`, `Cache` |

**Key design decisions:**
- Cache persisted between runs via `actions/cache@v4` (cache.json in project root, gitignored)
- Risk levels: `none | low | medium | high | critical` — only `medium`+ triggers alerts
- Articles are identified by MD5 hash of their URL to prevent re-processing
- Telegram is optional — gracefully skips if env vars not set

## Deployment

`.github/workflows/monitor.yml` defines the GitHub Actions workflow. Runs on schedule (`0 23,5,9,15 * * *` UTC) and manual dispatch. Uses `actions/cache@v4` to persist `cache.json` between runs.

GitHub config:
- **Secrets**: `GEMINI_API_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- **Variables**: `RECIPIENT_EMAIL`, `WATCH_KEYWORDS`

## TypeScript Config

- Target: ES2022, Module: CommonJS
- Strict mode enabled
- Output: `dist/`
- JSON module resolution enabled
