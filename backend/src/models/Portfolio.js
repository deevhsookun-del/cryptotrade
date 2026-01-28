const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    avgBuy: { type: Number, default: 0 },
  },
  { _id: false }
);

const TradeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    symbol: { type: String, required: true, uppercase: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    ts: { type: Number, required: true },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    mode: { type: String, enum: ["DEMO", "REAL"], default: "DEMO" },
    cashUSD: { type: Number, default: 10000 },
    holdings: { type: [HoldingSchema], default: [] },
    trades: { type: [TradeSchema], default: [] },
  },
  { timestamps: true }
);

PortfolioSchema.index({ userId: 1, mode: 1 }, { unique: true });

module.exports = mongoose.model("Portfolio", PortfolioSchema);
