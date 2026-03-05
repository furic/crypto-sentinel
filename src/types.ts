export interface Article {
  id: string; // md5 of url
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export interface RiskResult {
  risk_level: RiskLevel;
  summary: string;
  alerts: string[];
}

export interface Cache {
  seen_ids: string[];
  last_run: string;
}
