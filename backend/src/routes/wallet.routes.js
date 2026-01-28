const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Wallet = require("../models/Wallet");
const { getMarketsCached, findMarket } = require("../services/marketService");
const { getOrCreatePortfolio } = require("../services/portfolioService");

async function getOrCreateWallet(userId) {
  let w = await Wallet.findOne({ userId });
  if (!w) w = await Wallet.create({ userId, usd: 0, assets: [], transactions: [] });
  return w;
}

function upsertAsset(assets, symbol, deltaQty) {
  const s = String(symbol || "").toUpperCase();
  const idx = assets.findIndex((a) => a.symbol === s);
  if (idx === -1) assets.push({ symbol: s, qty: Number(deltaQty) });
  else assets[idx].qty = Number((assets[idx].qty + Number(deltaQty)).toFixed(8));
}

// Summary used by the UI
router.get("/summary", auth, async (req, res) => {
  try {
    const markets = await getMarketsCached();
    const w = await getOrCreateWallet(req.user.id);

    const assets = (w.assets || []).map((a) => {
      const m = findMarket(markets, a.symbol);
      const price = m?.price ?? 0;
      return {
        symbol: a.symbol,
        qty: a.qty,
        price,
        valueUSD: Number((a.qty * price).toFixed(2)),
      };
    });

    const assetsValueUSD = assets.reduce((s, a) => s + (a.valueUSD || 0), 0);
    const totalUSD = Number((w.usd + assetsValueUSD).toFixed(2));

    res.json({ usd: w.usd, assetsValueUSD, totalUSD, assets, transactions: w.transactions || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to load wallet", error: err.message });
  }
});

// Simulated card deposit (Visa/Mastercard)
router.post("/deposit/card", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amountUSD);
    const ref = String(req.body.reference || "CARD").slice(0, 64);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "amountUSD (>0) required" });

    const w = await getOrCreateWallet(req.user.id);
    w.usd = Number((w.usd + amount).toFixed(2));
    w.transactions.unshift({ type: "CARD_DEPOSIT", usd: amount, reference: ref, ts: Date.now() });
    await w.save();

    // Mirror to REAL portfolio cash so trading works like an exchange balance
    const p = await getOrCreatePortfolio(req.user.id, "REAL");
    p.cashUSD = w.usd;
    await p.save();

    const io = req.app.get("io");
    if (io) {
      const markets = await getMarketsCached();
      const assets = (w.assets || []).map((a) => {
        const m = findMarket(markets, a.symbol);
        const price = m?.price ?? 0;
        return {
          symbol: a.symbol,
          qty: a.qty,
          price,
          valueUSD: Number((a.qty * price).toFixed(2)),
        };
      });
      const assetsValueUSD = assets.reduce((s, a) => s + (a.valueUSD || 0), 0);
      const totalUSD = Number((w.usd + assetsValueUSD).toFixed(2));
      io.to(`user:${req.user.id}`).emit("wallet", {
        usd: w.usd,
        assetsValueUSD,
        totalUSD,
        assets,
        transactions: w.transactions || [],
      });
    }

    res.json({ message: "Deposit successful", usd: w.usd });
  } catch (err) {
    res.status(500).json({ message: "Deposit failed", error: err.message });
  }
});

// Simulated wallet-to-wallet crypto deposit
router.post("/deposit/crypto", auth, async (req, res) => {
  try {
    const symbol = String(req.body.symbol || "").toUpperCase();
    const qty = Number(req.body.qty);
    const ref = String(req.body.txHash || "TX").slice(0, 64);
    if (!symbol) return res.status(400).json({ message: "symbol required" });
    if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "qty (>0) required" });

    const markets = await getMarketsCached();
    const m = findMarket(markets, symbol);
    if (!m) return res.status(404).json({ message: "Unknown asset symbol" });

    const w = await getOrCreateWallet(req.user.id);
    upsertAsset(w.assets, symbol, qty);
    w.transactions.unshift({ type: "CRYPTO_DEPOSIT", symbol, qty, ts: Date.now(), reference: ref });
    await w.save();

    // Mirror to REAL portfolio holdings
    const p = await getOrCreatePortfolio(req.user.id, "REAL");
    const idx = p.holdings.findIndex((h) => h.symbol === symbol);
    if (idx === -1) p.holdings.push({ symbol, name: m.name, qty, avgBuy: m.price });
    else p.holdings[idx].qty = Number((p.holdings[idx].qty + qty).toFixed(8));
    await p.save();

    const io = req.app.get("io");
    if (io) {
      const marketsNow = await getMarketsCached();
      const assets = (w.assets || []).map((a) => {
        const mNow = findMarket(marketsNow, a.symbol);
        const price = mNow?.price ?? 0;
        return {
          symbol: a.symbol,
          qty: a.qty,
          price,
          valueUSD: Number((a.qty * price).toFixed(2)),
        };
      });
      const assetsValueUSD = assets.reduce((s, a) => s + (a.valueUSD || 0), 0);
      const totalUSD = Number((w.usd + assetsValueUSD).toFixed(2));
      io.to(`user:${req.user.id}`).emit("wallet", {
        usd: w.usd,
        assetsValueUSD,
        totalUSD,
        assets,
        transactions: w.transactions || [],
      });
    }

    res.json({ message: "Crypto deposit successful" });
  } catch (err) {
    res.status(500).json({ message: "Deposit failed", error: err.message });
  }
});

module.exports = router;
