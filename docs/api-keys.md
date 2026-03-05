---
title: API Keys
nav_order: 3
---

# API Keys

All services used have generous free tiers. No credit card required.

## Google Gemini (required)

Used for AI-powered risk analysis of news headlines.

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key to `GEMINI_API_KEY`

**Free tier:** 250 requests/day — more than enough for 4 runs/day.

## Resend (required)

Used to send HTML email alerts.

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys** → **Create API Key**
3. Copy the key to `RESEND_API_KEY`

**Free tier:** 3,000 emails/month.

Emails are sent from `onboarding@resend.dev` (Resend's shared sender) — no domain verification needed.

## Telegram (optional)

Sends alerts to a Telegram chat in addition to email.

### 1. Create a bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the bot token to `TELEGRAM_BOT_TOKEN`

### 2. Get your chat ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It replies with your chat ID
3. Copy it to `TELEGRAM_CHAT_ID`

### 3. Start a conversation

Send any message to your new bot so it can message you back.

## Summary

| Secret | Required | Source |
|--------|----------|--------|
| `GEMINI_API_KEY` | Yes | [aistudio.google.com](https://aistudio.google.com) |
| `RESEND_API_KEY` | Yes | [resend.com](https://resend.com) |
| `TELEGRAM_BOT_TOKEN` | No | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | No | [@userinfobot](https://t.me/userinfobot) |
