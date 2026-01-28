const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getMarketsCached } = require("../services/marketService");
const {
  snapshotPortfolio,
  buyAsset,
  sellAsset,
  getOrCreatePortfolio,
} = require("../services/portfolioService");

function getMode(req) {
  const queryMode = req?.query?.mode;
  const bodyMode = req?.body?.mode;

  const m = String(queryMode || bodyMode || "DEMO").toUpperCase();
  return m === "REAL" ? "REAL" : "DEMO";
}

// Helper: better error response for debugging + correct status codes
function sendErr(res, err, fallbackMsg, fallbackStatus = 500) {
  const status = err?.status || err?.statusCode || fallbackStatus;
  const msg = err?.message || fallbackMsg;

  console.error("❌ Trade route error:", {
    status,
    msg,
    stack: err?.stack,
  });

  return res.status(status).json({ message: msg, error: msg });
}

router.get("/portfolio", auth, async (req, res) => {
  const mode = getMode(req);
  console.log("📥 GET /trades/portfolio", { userId: req.user?.id, mode });

  try {
    // markets are public but fetched here for snapshot pricing
    const markets = await getMarketsCached({ perPage: 250, page: 1 });

    // IMPORTANT: this must auto-create a portfolio if missing
    const p = await getOrCreatePortfolio(req.user.id, mode);

    return res.json(snapshotPortfolio(p, markets));
  } catch (err) {
    return sendErr(res, err, "Failed to load portfolio", 500);
  }
});

router.post("/buy", auth, async (req, res) => {
  const mode = getMode(req);
  console.log("🟢 POST /trades/buy", { userId: req.user?.id, mode });

  try {
    const { symbol, qty } = req.body;
    const q = Number(qty);

    if (!symbol || !Number.isFinite(q) || q <= 0) {
      return res.status(400).json({ message: "symbol and qty (>0) required" });
    }

    const markets = await getMarketsCached({ perPage: 250, page: 1 });

    const p = await buyAsset({
      userId: req.user.id,
      symbol,
      qty: q,
      markets,
      mode,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.user.id}`).emit("portfolio", {
        mode,
        portfolio: snapshotPortfolio(p, markets),
      });
    }

    return res.json({
      message: "Buy executed",
      portfolio: snapshotPortfolio(p, markets),
    });
  } catch (err) {
    return sendErr(res, err, "Buy failed", 500);
  }
});

router.post("/sell", auth, async (req, res) => {
  const mode = getMode(req);
  console.log("🔴 POST /trades/sell", { userId: req.user?.id, mode });

  try {
    const { symbol, qty } = req.body;
    const q = Number(qty);

    if (!symbol || !Number.isFinite(q) || q <= 0) {
      return res.status(400).json({ message: "symbol and qty (>0) required" });
    }

    const markets = await getMarketsCached({ perPage: 250, page: 1 });

    const p = await sellAsset({
      userId: req.user.id,
      symbol,
      qty: q,
      markets,
      mode,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.user.id}`).emit("portfolio", {
        mode,
        portfolio: snapshotPortfolio(p, markets),
      });
    }

    return res.json({
      message: "Sell executed",
      portfolio: snapshotPortfolio(p, markets),
    });
  } catch (err) {
    return sendErr(res, err, "Sell failed", 500);
  }
});

module.exports = router;
