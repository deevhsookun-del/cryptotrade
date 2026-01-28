import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function money(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function Deposit() {
  const [wallet, setWallet] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [tab, setTab] = useState("card"); // card | crypto
  const [amountUSD, setAmountUSD] = useState(100);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [symbol, setSymbol] = useState("BTC");
  const [qty, setQty] = useState(0.01);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const selected = useMemo(() => markets.find((m) => m.symbol === String(symbol).toUpperCase()) || null, [markets, symbol]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [wRes, mRes] = await Promise.all([
        api.get("/wallet/summary"),
        api.get("/markets?perPage=100&page=1"),
      ]);
      setWallet(wRes.data);
      setMarkets(Array.isArray(mRes.data) ? mRes.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitCard() {
    try {
      setError("");
      setOk("");
      const a = Number(amountUSD);
      if (!Number.isFinite(a) || a <= 0) return setError("Amount must be > 0");
      await api.post("/wallet/deposit/card", { amountUSD: a, reference: "VISA/MC" });
      setOk("Deposit successful. Your REAL balance is now funded.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Deposit failed");
    }
  }

  async function submitCrypto() {
    try {
      setError("");
      setOk("");
      const q = Number(qty);
      if (!symbol) return setError("Choose a crypto asset");
      if (!Number.isFinite(q) || q <= 0) return setError("Qty must be > 0");
      await api.post("/wallet/deposit/crypto", { symbol, qty: q, txHash: txHash || "SIMULATED" });
      setOk("Crypto deposit recorded. You can now trade in REAL mode.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Deposit failed");
    }
  }

  return (
    <div className="section">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>Deposit</h1>
            <div className="p" style={{ marginTop: 6 }}>
              Fund your account (exchange-style flow). This project uses a safe simulated deposit system for demonstration.
            </div>
          </div>
          <div className="row">
            <button className="btn btn-ghost" type="button" onClick={load}>Refresh</button>
            <Link className="btn btn-primary" to="/trade-real">Go to Trade</Link>
          </div>
        </div>

        {loading && <div className="p" style={{ marginTop: 14 }}>Loading wallet…</div>}
        {error && <div className="p" style={{ marginTop: 14 }}>❌ {error}</div>}
        {ok && <div className="p" style={{ marginTop: 14 }}>✅ {ok}</div>}

        {!loading && wallet && (
          <>
            <div className="grid3" style={{ marginTop: 14 }}>
              <div className="card" style={{ padding: 14 }}>
                <div className="small">Available USD</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(wallet.usd)}</div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div className="small">Crypto Value</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(wallet.assetsValueUSD)}</div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div className="small">Total Wallet Value</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(wallet.totalUSD)}</div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <button className={"btn " + (tab === "card" ? "btn-primary" : "btn-ghost")} type="button" onClick={() => setTab("card")}>Card Deposit</button>
              <button className={"btn " + (tab === "crypto" ? "btn-primary" : "btn-ghost")} type="button" onClick={() => setTab("crypto")}>Wallet-to-Wallet (Crypto)</button>
            </div>

            {tab === "card" ? (
              <div className="card" style={{ marginTop: 14, padding: 16 }}>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>Visa / Mastercard Deposit (Simulated)</div>
                <div className="p" style={{ marginTop: 6 }}>
                  Enter an amount in USD. For this academic project, the system records the deposit and funds your REAL balance.
                </div>

                <div className="grid2" style={{ marginTop: 12 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div className="small">Card preview (visual only)</div>
                    <div
                      style={{
                        marginTop: 10,
                        borderRadius: 18,
                        padding: 16,
                        minHeight: 140,
                        border: "1px solid var(--line)",
                        background:
                          "linear-gradient(160deg, rgba(109,92,255,0.45), rgba(53,208,127,0.18))",
                      }}
                    >
                      <div style={{ fontWeight: 900, letterSpacing: "0.08em" }}>
                        {cardNumber ? cardNumber.replace(/\D/g, "").padEnd(16, "•").replace(/(.{4})/g, "$1 ") : "•••• •••• •••• ••••"}
                      </div>
                      <div className="row" style={{ marginTop: 18, justifyContent: "space-between" }}>
                        <div>
                          <div className="small">Cardholder</div>
                          <div style={{ fontWeight: 800 }}>{cardName || "FULL NAME"}</div>
                        </div>
                        <div>
                          <div className="small">Exp</div>
                          <div style={{ fontWeight: 800 }}>{cardExp || "MM/YY"}</div>
                        </div>
                      </div>
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                      This is a demo. No real card data is processed.
                    </div>
                  </div>

                  <div>
                    <div className="field">
                      <div className="label">Full name</div>
                      <input
                        className="input"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        autoComplete="cc-name"
                      />
                    </div>
                    <div className="field">
                      <div className="label">Card number</div>
                      <input
                        className="input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </div>
                    <div className="grid2">
                      <div className="field">
                        <div className="label">Expiry</div>
                        <input
                          className="input"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div className="field">
                        <div className="label">CVV</div>
                        <input
                          className="input"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>

                    <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 220 }}>
                        <div className="label">Amount (USD)</div>
                        <input className="input" value={amountUSD} onChange={(e) => setAmountUSD(e.target.value)} inputMode="decimal" />
                      </div>
                      <div style={{ alignSelf: "end" }}>
                        <button className="btn btn-primary" type="button" onClick={submitCard}>Deposit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginTop: 14, padding: 16 }}>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>Crypto Deposit (Wallet-to-Wallet)</div>
                <div className="p" style={{ marginTop: 6 }}>
                  Select an asset and enter the quantity you want to deposit. A simulated TX hash can be provided for logging.
                </div>

                <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 220 }}>
                    <div className="label">Asset</div>
                    <select className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                      {markets.map((m) => (
                        <option key={m.id} value={m.symbol}>{m.symbol} — {m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <div className="label">Qty</div>
                    <input className="input" value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
                    <div className="small" style={{ marginTop: 6 }}>
                      Est. value: <strong>{money(Number(qty) * Number(selected?.price || 0))}</strong>
                    </div>
                  </div>
                  <div style={{ minWidth: 260 }}>
                    <div className="label">Tx Hash (optional)</div>
                    <input className="input" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="e.g. 0xabc..." />
                  </div>
                  <div style={{ alignSelf: "end" }}>
                    <button className="btn btn-primary" type="button" onClick={submitCrypto}>Record Deposit</button>
                  </div>
                </div>
              </div>
            )}

            <div className="card" style={{ marginTop: 14, padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>Wallet assets</div>
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Symbol</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Qty</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Price</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(wallet.assets || []).length === 0 ? (
                      <tr><td colSpan={4} className="small" style={{ padding: "12px 8px" }}>No crypto deposits yet.</td></tr>
                    ) : (
                      wallet.assets.map((a) => (
                        <tr key={a.symbol}>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", fontWeight: 900 }}>{a.symbol}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{a.qty}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{money(a.price)}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", fontWeight: 900 }}>{money(a.valueUSD)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
