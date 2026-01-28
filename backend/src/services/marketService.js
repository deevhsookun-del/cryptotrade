let CACHE = { ts: 0, data: [] };
const CACHE_MS = 30_000; // 30 seconds (more stable than 15s)

function normalize(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((c) => ({
    id: c.id,
    name: c.name,
    symbol: String(c.symbol || "").toUpperCase(),
    image: c.image,
    price: Number(c.current_price || 0),
    change24h: Number(c.price_change_percentage_24h || 0),
    marketCap: Number(c.market_cap || 0),
  }));
}

// Always fetch 250 once, then slice in-memory for any request
function buildUrlBigList() {
  return (
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd&order=market_cap_desc&per_page=250&page=1" +
    "&sparkline=false&price_change_percentage=24h"
  );
}

async function refreshCacheIfNeeded() {
  const now = Date.now();

  // ✅ fresh cache
  if (CACHE.data.length && now - CACHE.ts < CACHE_MS) return;

  const url = buildUrlBigList();
  const r = await fetch(url, { headers: { accept: "application/json" } });

  // ✅ If CoinGecko fails, keep old cache (do NOT crash app)
  if (!r.ok) {
    if (CACHE.data.length) return;
    throw new Error("CoinGecko fetch failed");
  }

  const raw = await r.json();
  CACHE = { ts: now, data: normalize(raw) };
}

async function getMarketsCached(opts = {}) {
  const perPage = Math.min(250, Math.max(1, Number(opts.perPage) || 100));
  const page = Math.max(1, Number(opts.page) || 1);

  await refreshCacheIfNeeded();

  const start = (page - 1) * perPage;
  const end = start + perPage;
  return CACHE.data.slice(start, end);
}

function findMarket(markets, symbol) {
  const s = String(symbol || "").toUpperCase();
  return markets.find((m) => m.symbol === s) || null;
}

module.exports = { getMarketsCached, findMarket };
