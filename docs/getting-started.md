---
title: Getting Started
nav_order: 2
---

# Getting Started

## Recommended: Fork and Deploy

The easiest way to use Crypto Sentinel is to **fork this repo** and add your secrets and variables — no local setup needed. See the [Quick Start on the home page](.) or [Deployment](deployment) for details.

## Local Development

If you want to run locally or contribute:

### Prerequisites

- **Node.js** 22+
- **npm** (comes with Node)

### Installation

```bash
git clone https://github.com/furic/crypto-sentinel.git
cd crypto-sentinel
npm install
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
GEMINI_API_KEY=your-gemini-key
RESEND_API_KEY=your-resend-key
RECIPIENT_EMAIL=your@email.com
WATCH_KEYWORDS=binance,bybit,youhodler
```

See [API Keys](api-keys) for step-by-step instructions on getting each key.

### First Run

```bash
npm run dev
```

This will:
1. Fetch RSS feeds and Google News for your keywords
2. Filter for relevant articles
3. Send new articles to Gemini for risk analysis
4. Email you if risk is `medium` or above
5. Save seen articles to `cache.json` to avoid duplicates

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run directly with ts-node (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled version (requires build) |

## Next Steps

- [Configure keywords and thresholds](configuration)
- [Set up API keys](api-keys)
- [Deploy to GitHub Actions](deployment)
