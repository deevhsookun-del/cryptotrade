import Trade from "./Trade";

// Reuse the Trade UI but run it in REAL mode (funded by deposits).
export default function TradeReal() {
  return <Trade mode="REAL" title="Trade" />;
}
