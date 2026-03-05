---
title: Deployment
nav_order: 5
---

# Deployment

Crypto Sentinel runs on GitHub Actions as a scheduled workflow. No server needed.

## GitHub Setup

### Repository Secrets

Go to **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Required |
|--------|----------|
| `GEMINI_API_KEY` | Yes |
| `RESEND_API_KEY` | Yes |
| `TELEGRAM_BOT_TOKEN` | No |
| `TELEGRAM_CHAT_ID` | No |

### Repository Variables

Go to **Settings → Secrets and variables → Actions → Variables**:

| Variable | Example |
|----------|---------|
| `RECIPIENT_EMAIL` | `your@email.com` |
| `WATCH_KEYWORDS` | `binance,bybit,youhodler` |

## How It Runs

The workflow (`.github/workflows/monitor.yml`):

1. Checks out the repo
2. Sets up Node.js 22 with npm cache
3. Restores `cache.json` from GitHub Actions cache
4. Installs dependencies (`npm ci`)
5. Builds TypeScript (`npm run build`)
6. Runs the sentinel (`node dist/index.js`)
7. Actions cache automatically saves updated `cache.json`

## Manual Trigger

Go to **Actions → Crypto Sentinel → Run workflow** in GitHub to trigger a run immediately.

## Cache Persistence

Seen articles are tracked in `cache.json` to avoid re-processing. This file is persisted between runs using `actions/cache@v4` — it's not committed to the repo.

The cache keeps the last 500 article IDs. Old entries are automatically pruned.
