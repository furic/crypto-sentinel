---
title: Configuration
nav_order: 4
---

# Configuration

## Watch Keywords

Set `WATCH_KEYWORDS` as a comma-separated list of keywords to monitor. These are used for both RSS feed filtering and Google News queries.

```bash
WATCH_KEYWORDS=binance,bybit,youhodler
```

- Keywords are **case-insensitive**
- Article titles are matched if they contain any keyword
- Google News queries use the first word of each keyword (e.g. `youhodler` → searches for `"youhodler crypto"`)
- Default: `bybit,youhodler`

## Alert Thresholds

Only `medium`, `high`, and `critical` risk levels trigger email and Telegram alerts. `low` and `none` are logged but silent.

| Level | Emoji | Example Triggers |
|-------|-------|------------------|
| critical | 🚨 | Insolvency, confirmed hack, withdrawal freeze |
| high | 🔴 | Security breach, regulatory enforcement |
| medium | 🟡 | Regulatory warning, leadership changes |
| low | 🟢 | Minor negative press, market coverage |
| none | ⚪ | Neutral / positive news |

## News Sources

Headlines are fetched from these RSS feeds:

| Source | URL |
|--------|-----|
| CoinTelegraph | `cointelegraph.com/rss` |
| Decrypt | `decrypt.co/feed` |
| The Block | `theblock.co/rss.xml` |
| CryptoSlate | `cryptoslate.com/feed/` |
| Google News | Dynamic — one query per keyword |

## Schedule

The GitHub Actions workflow runs 4 times per day at:

| AEDT (UTC+11) | UTC |
|----------------|-----|
| 10:00 AM | 23:00 |
| 4:00 PM | 05:00 |
| 10:00 PM | 09:00* |
| 4:00 AM | 15:00* |

*Next day UTC

Cron expression: `0 23,5,9,15 * * *`

You can adjust the schedule in `.github/workflows/monitor.yml`.
