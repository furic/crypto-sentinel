import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Article, RiskResult } from "./types.js";

const RISK_PROMPT = `You are a financial risk monitor for crypto exchange holdings.

The user holds assets on various crypto exchanges. Analyze the following news headlines and return ONLY a JSON object (no markdown, no code fences) with this exact structure:
{
  "risk_level": "none" | "low" | "medium" | "high" | "critical",
  "summary": "1-2 sentence plain-English explanation",
  "alerts": ["specific concern 1", "specific concern 2"]
}

Risk level criteria:
- CRITICAL: insolvency, confirmed hack, withdrawal freeze, regulatory shutdown, bankruptcy
- HIGH: major security breach, regulatory enforcement action, suspected bank run, leadership fraud
- MEDIUM: regulatory warning/investigation, significant partnership failure, major leadership departure, unverified hack rumours
- LOW: minor negative press, market downturn coverage, routine platform changes
- NONE: neutral news, positive coverage, unrelated crypto news

If alerts array is empty for none/low, return [].
Only include alerts for medium and above.

Headlines to analyze:
`;

export const analyzeRisk = async (articles: Article[]): Promise<RiskResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const headlineList = articles
    .map((a) => `- [${a.source}] ${a.title}`)
    .join("\n");

  const result = await model.generateContent(RISK_PROMPT + headlineList);
  const text = result.response.text().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text) as RiskResult;
  } catch {
    console.error("[analyze] Failed to parse Gemini response:", text);
    // Fallback — treat as low risk rather than crash
    return {
      risk_level: "low",
      summary: "Could not parse AI analysis. Manual review recommended.",
      alerts: ["AI analysis parse failure — check logs"],
    };
  }
};
