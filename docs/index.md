---
title: Home
layout: home
nav_order: 1
---

# Crypto Sentinel

An AI-powered crypto news monitor that watches for risk signals about your exchanges and coins. It fetches headlines from multiple sources, runs AI risk analysis via Google Gemini, and alerts you via email and Telegram — automatically, 4 times a day via GitHub Actions.

**Everything runs on free tiers. No server, no dashboard, no ongoing costs.**

---

## What You Get

When risk is detected, you receive a polished alert with an AI summary, specific concerns, and source articles:

![Email Alert](mockups/email-alert.png){: style="max-width: 400px; display: block; margin: 16px auto;" }

| Component | Service | Cost |
|-----------|---------|------|
| News Feeds | RSS (CoinTelegraph, Decrypt, The Block, CryptoSlate, Google News) | Free |
| AI Analysis | Google Gemini 2.5 Flash | Free (250 req/day) |
| Email Alerts | Resend.com | Free (3,000/month) |
| Telegram Alerts | Telegram Bot API | Free |
| Scheduler | GitHub Actions | Free (cron) |

---

## Quick Start

The easiest way to use Crypto Sentinel is to **fork this repo** and configure it with your own secrets and variables — no code changes needed.

1. **Fork** this repo on GitHub
2. **Get your API keys** — see [API Keys](api-keys) for step-by-step instructions
3. **Add config** — go to your fork's `Settings → Secrets and variables → Actions`:
   - **Secrets** tab: `GEMINI_API_KEY`, `RESEND_API_KEY`
   - **Variables** tab: `RECIPIENT_EMAIL` (your email), `WATCH_KEYWORDS` (e.g. `binance,bybit,youhodler`)
4. **Enable Actions** — go to the Actions tab in your fork and enable workflows
5. **Done** — the monitor runs automatically 4x/day

See [Getting Started](getting-started) for local development, or [Deployment](deployment) for full GitHub Actions details.

---

## Documentation

| Page | Description |
|------|-------------|
| [Getting Started](getting-started) | Prerequisites, installation, and first run |
| [API Keys](api-keys) | Step-by-step setup for Gemini, Resend, and Telegram |
| [Configuration](configuration) | Keywords, alert thresholds, and schedule |
| [Deployment](deployment) | GitHub Actions, secrets, variables, manual triggers |
| [How It Works](how-it-works) | Architecture, data pipeline, AI analysis |
