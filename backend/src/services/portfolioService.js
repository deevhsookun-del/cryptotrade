const Portfolio = require("../models/Portfolio");
const { findMarket } = require("./marketService");

async function getOrCreatePortfolio(userId, mode = "DEMO") {
  const m = String(mode || "DEMO").toUpperCase() === "REAL" ? "REAL" : "DEMO";

  const doc = await Portfolio.findOneAndUpdate(
    { userId, mode: m },   // ✅ IMPORTANT: include mode
    {
      $setOnInsert: {
        userId,
        mode: m,
        cashUSD: m === "DEMO" ? 100000 : 0, // demo starts funded, real starts 0
        holdings: [],
        trades: [],
      },
    },
    { new: true, upsert: true }
  );

  return doc;
}



function snapshotPortfolio(p, markets) {
  const holdings = (p.holdings || []).map((h) => {
    const m = findMarket(markets, h.symbol);
    const price = m?.price ?? 0;
    const value = h.qty * price;
    const pnl = value - h.qty * h.avgBuy;
    return { ...h.toObject(), price, value, pnl };
  });

  const holdingsValue = holdings.reduce((s, h) => s + (h.value || 0), 0);
  const totalUSD = p.cashUSD + holdingsValue;

  return {
    mode: p.mode || "DEMO",
    cashUSD: p.cashUSD,
    holdingsValue,
    totalUSD,
    holdings,
    trades: p.trades || [],
  };
}

async function buyAsset({ userId, symbol, qty, markets, mode = "DEMO" }) {
  const m = findMarket(markets, symbol);
  if (!m) {
    const err = new Error("Unknown asset symbol");
    err.status = 404;
    throw err;
  }

  const p = await getOrCreatePortfolio(userId, mode);
  const cost = qty * m.price;
  if (p.cashUSD < cost) {
    const err = new Error("Insufficient cash balance");
    err.status = 400;
    throw err;
  }

  const idx = p.holdings.findIndex((h) => h.symbol === m.symbol);
  if (idx === -1) {
    p.holdings.push({ symbol: m.symbol, name: m.name, qty, avgBuy: m.price });
  } else {
    const existing = p.holdings[idx];
    const newQty = existing.qty + qty;
    const newAvg = (existing.qty * existing.avgBuy + qty * m.price) / newQty;
    p.holdings[idx] = { ...existing.toObject(), qty: newQty, avgBuy: newAvg };
  }

  p.cashUSD = Number((p.cashUSD - cost).toFixed(2));
  p.trades.unshift({ type: "BUY", symbol: m.symbol, qty, price: m.price, total: cost, ts: Date.now() });

  await p.save();
  return p;
}

async function sellAsset({ userId, symbol, qty, markets, mode = "DEMO" }) {
  const m = findMarket(markets, symbol);
  if (!m) {
    const err = new Error("Unknown asset symbol");
    err.status = 404;
    throw err;
  }

  const p = await getOrCreatePortfolio(userId, mode);
  const idx = p.holdings.findIndex((h) => h.symbol === m.symbol);
  if (idx === -1 || p.holdings[idx].qty < qty) {
    const err = new Error("Insufficient holdings to sell");
    err.status = 400;
    throw err;
  }

  const proceeds = qty * m.price;
  const remaining = Number((p.holdings[idx].qty - qty).toFixed(8));

  if (remaining <= 0) p.holdings.splice(idx, 1);
  else p.holdings[idx].qty = remaining;

  p.cashUSD = Number((p.cashUSD + proceeds).toFixed(2));
  p.trades.unshift({ type: "SELL", symbol: m.symbol, qty, price: m.price, total: proceeds, ts: Date.now() });

  await p.save();
  return p;
}

module.exports = { getOrCreatePortfolio, snapshotPortfolio, buyAsset, sellAsset };
