import { fetchArticles } from "./feeds.js";
import { analyzeRisk } from "./analyze.js";
import { sendAlert } from "./notify.js";
import { loadCache, saveCache } from "./cache.js";

// Only alert for these risk levels and above
const ALERT_THRESHOLD: string[] = ["medium", "high", "critical"];

const run = async (): Promise<void> => {
  console.log(`[sentinel] Starting run at ${new Date().toISOString()}`);

  // 1. Load seen article cache
  const cache = loadCache();
  const seenIds = new Set(cache.seen_ids);
  console.log(`[sentinel] Cache loaded — ${seenIds.size} seen articles`);

  // 2. Fetch fresh articles
  const allArticles = await fetchArticles();
  console.log(`[sentinel] Fetched ${allArticles.length} relevant articles total`);

  // 3. Filter to only unseen ones
  const newArticles = allArticles.filter((a) => !seenIds.has(a.id));
  console.log(`[sentinel] ${newArticles.length} new articles to analyse`);

  if (newArticles.length === 0) {
    console.log("[sentinel] No new articles — exiting cleanly");
    return;
  }

  // 4. Run AI risk analysis
  const risk = await analyzeRisk(newArticles);
  console.log(`[sentinel] Risk level: ${risk.risk_level} — ${risk.summary}`);

  // 5. Update cache regardless of alert decision
  cache.seen_ids = [...seenIds, ...newArticles.map((a) => a.id)];
  saveCache(cache);

  // 6. Send alert only if above threshold
  if (ALERT_THRESHOLD.includes(risk.risk_level)) {
    console.log("[sentinel] Threshold met — sending alert email");
    await sendAlert(risk, newArticles);
  } else {
    console.log(`[sentinel] Risk level "${risk.risk_level}" is below threshold — no email sent`);
  }

  console.log("[sentinel] Run complete");
};

run().catch((err) => {
  console.error("[sentinel] Fatal error:", err);
  process.exit(1);
});
