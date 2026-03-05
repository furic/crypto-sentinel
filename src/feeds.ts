import Parser from "rss-parser";
import * as crypto from "crypto";
import type { Article } from "./types.js";

const parser = new Parser({ timeout: 10000 });

/**
 * Google News RSS links are redirect wrappers (news.google.com/rss/articles/...).
 * Resolve them to the actual article URL by following the redirect.
 * This prevents issues with email click-tracking proxies (e.g. Resend) being
 * blocked by Google's bot detection.
 */
const resolveGoogleNewsUrl = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Use the final URL after redirects
    if (res.url && res.url !== url) return res.url;
  } catch {
    // If HEAD fails, try GET with manual redirect
    try {
      const res = await fetch(url, { redirect: "manual" });
      const location = res.headers.get("location");
      if (location) return location;
    } catch {
      // Fall through to return original
    }
  }
  return url;
};

// RSS feeds that reliably cover crypto exchange news
const RSS_FEEDS = [
  {
    source: "CoinTelegraph",
    url: "https://cointelegraph.com/rss",
  },
  {
    source: "Decrypt",
    url: "https://decrypt.co/feed",
  },
  {
    source: "The Block",
    url: "https://www.theblock.co/rss.xml",
  },
  {
    source: "CryptoSlate",
    url: "https://cryptoslate.com/feed/",
  },
];

// Keywords to filter relevant articles — loaded from WATCH_KEYWORDS env var (comma-separated)
const KEYWORDS: string[] = (process.env.WATCH_KEYWORDS ?? "bybit,youhodler")
  .split(",")
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean);

const makeId = (url: string): string =>
  crypto.createHash("md5").update(url).digest("hex");

const isRelevant = (title: string): boolean => {
  const lower = title.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
};

export const fetchArticles = async (): Promise<Article[]> => {
  const articles: Article[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items ?? []) {
        const title = item.title ?? "";
        const url = item.link ?? "";
        if (!title || !url) continue;
        if (!isRelevant(title)) continue;

        articles.push({
          id: makeId(url),
          title,
          url,
          source: feed.source,
          publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[feeds] Failed to fetch ${feed.source}: ${(err as Error).message}`);
    }
  }

  // Also try Google News RSS (no key needed)
  // Derive unique search terms from keywords (take first word of multi-word keywords, dedupe)
  const googleQueries = [...new Set(KEYWORDS.map((k) => k.split(" ")[0]))];
  for (const query of googleQueries) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " crypto")}&hl=en-AU&gl=AU&ceid=AU:en`;
      const parsed = await parser.parseURL(url);
      const items = parsed.items?.slice(0, 10) ?? [];
      // Resolve all Google News redirect URLs in parallel
      const resolved = await Promise.all(
        items.map(async (item) => {
          const title = item.title ?? "";
          const link = item.link ?? "";
          if (!title || !link) return null;
          const realUrl = await resolveGoogleNewsUrl(link);
          return {
            id: makeId(realUrl),
            title,
            url: realUrl,
            source: "Google News" as const,
            publishedAt: item.pubDate ?? new Date().toISOString(),
          };
        })
      );
      for (const article of resolved) {
        if (article) articles.push(article);
      }
    } catch (err) {
      console.warn(`[feeds] Google News failed for "${query}": ${(err as Error).message}`);
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
};
