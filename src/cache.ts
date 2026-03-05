import * as fs from "fs";
import * as path from "path";
import type { Cache } from "./types.js";

// In GitHub Actions the cache file lives next to the script.
// Locally it lives in the project root.
const CACHE_PATH = path.resolve(process.cwd(), "cache.json");
const MAX_IDS = 500; // prevent unbounded growth

export const loadCache = (): Cache => {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")) as Cache;
    }
  } catch {
    console.warn("[cache] Could not read cache, starting fresh");
  }
  return { seen_ids: [], last_run: "" };
};

export const saveCache = (cache: Cache): void => {
  // Trim to last MAX_IDS to prevent file bloat
  cache.seen_ids = cache.seen_ids.slice(-MAX_IDS);
  cache.last_run = new Date().toISOString();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
};
