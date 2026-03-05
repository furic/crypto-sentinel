import { Resend } from "resend";
import type { Article, RiskResult } from "./types.js";

const RISK_COLOURS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#65a30d",
  none: "#6b7280",
};

const RISK_EMOJI: Record<string, string> = {
  critical: "🚨",
  high: "🔴",
  medium: "🟡",
  low: "🟢",
  none: "⚪",
};

const buildHtml = (risk: RiskResult, articles: Article[]): string => {
  const colour = RISK_COLOURS[risk.risk_level] ?? "#6b7280";
  const emoji = RISK_EMOJI[risk.risk_level] ?? "⚪";

  const alertItems =
    risk.alerts.length > 0
      ? `<ul style="margin:8px 0;padding-left:20px;">
          ${risk.alerts.map((a) => `<li style="margin:4px 0;">${a}</li>`).join("")}
        </ul>`
      : "<p style='color:#6b7280;margin:8px 0;'>No specific concerns flagged.</p>";

  const articleRows = articles
    .slice(0, 20)
    .map(
      (a) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px;">${a.source}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;">
            <a href="${a.url}" style="color:#3b82f6;text-decoration:none;">${a.title}</a>
          </td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:${colour};padding:20px 24px;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">
        ${emoji} Crypto Sentinel — ${risk.risk_level.toUpperCase()} Risk Detected
      </h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" })} AEDT
      </p>
    </div>

    <!-- Summary -->
    <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
      <h2 style="margin:0 0 8px;font-size:15px;color:#1e293b;">AI Summary</h2>
      <p style="margin:0;color:#334155;line-height:1.6;">${risk.summary}</p>
    </div>

    <!-- Alerts -->
    <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
      <h2 style="margin:0 0 8px;font-size:15px;color:#1e293b;">Specific Concerns</h2>
      ${alertItems}
    </div>

    <!-- Articles -->
    <div style="padding:20px 24px;">
      <h2 style="margin:0 0 12px;font-size:15px;color:#1e293b;">
        Source Articles (${articles.length} new)
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:6px 8px;text-align:left;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Source</th>
            <th style="padding:6px 8px;text-align:left;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Headline</th>
          </tr>
        </thead>
        <tbody>${articleRows}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        crypto-sentinel · Not financial advice · 
        <a href="https://github.com" style="color:#94a3b8;">GitHub</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

export const sendAlert = async (
  risk: RiskResult,
  articles: Article[]
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ALERT_EMAIL;
  const fromEmail = process.env.FROM_EMAIL ?? "sentinel@yourdomain.com";

  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (!toEmail) throw new Error("ALERT_EMAIL is not set");

  const resend = new Resend(apiKey);
  const emoji = RISK_EMOJI[risk.risk_level] ?? "⚪";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `${emoji} [Crypto Sentinel] ${risk.risk_level.toUpperCase()} — ${risk.summary.slice(0, 80)}`,
    html: buildHtml(risk, articles),
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log(`[notify] Alert sent to ${toEmail}`);
};
