import type { Article, RiskResult } from "./types.js";

const RISK_EMOJI: Record<string, string> = {
  critical: "🚨",
  high: "🔴",
  medium: "🟡",
  low: "🟢",
  none: "⚪",
};

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildMessage = (risk: RiskResult, articles: Article[]): string => {
  const emoji = RISK_EMOJI[risk.risk_level] ?? "⚪";
  const timestamp = new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" });

  const alerts =
    risk.alerts.length > 0
      ? risk.alerts.map((a) => `  • ${escapeHtml(a)}`).join("\n")
      : "  No specific concerns flagged.";

  const headlines = articles
    .slice(0, 10)
    .map((a) => `  • [${escapeHtml(a.source)}] <a href="${a.url}">${escapeHtml(a.title)}</a>`)
    .join("\n");

  return [
    `${emoji} <b>Crypto Sentinel — ${risk.risk_level.toUpperCase()}</b>`,
    `${timestamp} AEDT`,
    "",
    `<b>Summary</b>`,
    escapeHtml(risk.summary),
    "",
    `<b>Concerns</b>`,
    alerts,
    "",
    `<b>Source Articles</b> (${articles.length} new)`,
    headlines,
  ].join("\n");
};

export const sendTelegramAlert = async (
  risk: RiskResult,
  articles: Article[]
): Promise<void> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping");
    return;
  }

  const message = buildMessage(risk, articles);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error ${response.status}: ${body}`);
  }

  console.log(`[telegram] Alert sent to chat ${chatId}`);
};
