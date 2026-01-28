const express = require("express");
const router = express.Router();
const { getMarketsCached } = require("../services/marketService");
const fetch = require("node-fetch");

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 100;
    const data = await getMarketsCached({ page, perPage });
    res.json(data);
  } catch (err) {
    res.status(502).json({ message: "Failed to fetch market data", error: err.message });
  }
});

module.exports = router;
