const mongoose = require("mongoose");

const AssetBalanceSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    qty: { type: Number, default: 0 },
  },
  { _id: false }
);

const WalletTxSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["CARD_DEPOSIT", "CRYPTO_DEPOSIT"], required: true },
    symbol: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    usd: { type: Number, default: 0 },
    reference: { type: String, default: "" },
    ts: { type: Number, required: true },
  },
  { _id: false }
);

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    usd: { type: Number, default: 0 },
    assets: { type: [AssetBalanceSchema], default: [] },
    transactions: { type: [WalletTxSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);
