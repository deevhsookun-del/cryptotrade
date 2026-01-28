import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { AreaSeries, createChart } from "lightweight-charts";
import { getSocket } from "../api/socket";

function money(n) {
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function StatCard({ title, value, note }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="p" style={{ fontWeight: 900, fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 900, fontSize: 26, marginTop: 8 }}>{value}</div>
      {note && <div className="small" style={{ marginTop: 8 }}>{note}</div>}
    </div>
  );
}

export default function Dashboard() {
  // ✅ Auth hook at the top (best practice)
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chartRef = useRef(null);
  const chartSeriesRef = useRef(null);
  const chartWrapRef = useRef(null);

  const holdingsValue = (portfolio?.holdings || []).reduce(
    (sum, h) => sum + h.qty * h.price,
    0
  );

  const total = (portfolio?.cashUSD || 0) + holdingsValue;

  const pnl = (portfolio?.holdings || []).reduce((sum, h) => {
    const cost = h.qty * h.avgBuy;
    const now = h.qty * h.price;
    return sum + (now - cost);
  }, 0);

  const pnlPct =
    holdingsValue > 0 ? (pnl / (holdingsValue - pnl)) * 100 : 0;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/trades/portfolio?mode=DEMO");
        setPortfolio(res.data);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onPortfolio = (payload) => {
      if (payload?.mode === "DEMO" && payload?.portfolio) {
        setPortfolio(payload.portfolio);
      }
    };
    socket.on("portfolio", onPortfolio);
    return () => socket.off("portfolio", onPortfolio);
  }, []);

  const allocation = useMemo(() => {
    const holdings = portfolio?.holdings || [];
    const totalValue = holdings.reduce((s, h) => s + (h.value || 0), 0) || 1;
    const palette = ["#6d5cff", "#35d07f", "#ffcf5c", "#ff5c7a", "#4cc9f0"];
    let acc = 0;
    const slices = holdings.map((h, i) => {
      const pct = (h.value || 0) / totalValue;
      const start = acc * 100;
      acc += pct;
      const end = acc * 100;
      return { color: palette[i % palette.length], start, end, label: h.symbol, pct };
    });
    return { slices, totalValue };
  }, [portfolio]);

  const equitySeries = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const trades = (portfolio?.trades || []).slice(0, 20).reverse();
    if (!trades.length) {
      return Array.from({ length: 20 }).map((_, i) => ({
        time: now - (19 - i) * 3600,
        value: Number(total.toFixed(2)),
      }));
    }
    const base = total || 1;
    return trades.map((t, i) => ({
      time: Math.floor(t.ts / 1000),
      value: Number((base * (0.98 + i * 0.004)).toFixed(2)),
    }));
  }, [portfolio, total]);

  useEffect(() => {
    if (!chartWrapRef.current) return;
    if (chartRef.current) return;
    chartRef.current = createChart(chartWrapRef.current, {
      height: 220,
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.8)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: { borderColor: "rgba(255,255,255,0.1)" },
    });
    chartSeriesRef.current = chartRef.current.addSeries(AreaSeries, {
      lineColor: "rgba(53, 208, 127, 0.95)",
      topColor: "rgba(53, 208, 127, 0.35)",
      bottomColor: "rgba(53, 208, 127, 0.02)",
    });
  }, []);

  useEffect(() => {
    if (!chartSeriesRef.current) return;
    if (equitySeries.length) chartSeriesRef.current.setData(equitySeries);
  }, [equitySeries]);

  return (
    <div>
      {/* Top header */}
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <h1 style={{ margin: 0 }}>Dashboard</h1>

                {/* MODE badge */}
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "rgba(109,92,255,.10)",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  {portfolio?.mode || "DEMO"} MODE
                </span>

                {/* ✅ Logged-in user badge */}
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "rgba(46, 204, 113, .12)",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  ✅ Logged in as: {user?.name || user?.email}
                </span>
              </div>

              <div className="p" style={{ marginTop: 8 }}>
                Overview of your balance, holdings, and recent performance.
              </div>
            </div>

            <div className="row">
              <Link className="btn btn-ghost" to="/markets">Markets</Link>
              <Link className="btn btn-primary" to="/trade">Trade</Link>
            </div>
          </div>
        </div>
      </section>

      {loading && <div className="p" style={{ marginTop: 12 }}>Loading portfolio…</div>}
      {error && <div className="p" style={{ marginTop: 12 }}>❌ {error}</div>}

      {/* Stats */}
      <section className="section">
        <div className="grid3">
          <StatCard
            title="Total Balance"
            value={money(total)}
            note="Cash + holdings value"
          />
          <StatCard
            title="Cash (USD)"
            value={money(portfolio?.cashUSD || 0)}
            note="Available to trade"
          />
          <StatCard
            title="Holdings Value"
            value={money(holdingsValue)}
            note={`P/L: ${pnl >= 0 ? "+" : ""}${money(pnl)} (${
              isFinite(pnlPct) ? pnlPct.toFixed(2) : "0.00"
            }%)`}
          />
        </div>
      </section>

      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Portfolio performance</div>
            <div className="small" style={{ marginTop: 6 }}>
              Equity curve (demo analytics)
            </div>
            <div className="chartPlaceholder" ref={chartWrapRef}>
              <div className="chartFrame" />
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Allocation</div>
            <div className="small" style={{ marginTop: 6 }}>
              Holdings distribution by value
            </div>
            <div
              style={{
                marginTop: 14,
                height: 180,
                borderRadius: "999px",
                background: allocation.slices.length
                  ? `conic-gradient(${allocation.slices
                      .map((s) => `${s.color} ${s.start}% ${s.end}%`)
                      .join(", ")})`
                  : "rgba(255,255,255,0.08)",
              }}
            />
            <div className="small" style={{ marginTop: 12, lineHeight: 1.7 }}>
              {allocation.slices.length === 0
                ? "No holdings yet."
                : allocation.slices.map((s) => (
                    <div key={s.label} className="row" style={{ justifyContent: "space-between" }}>
                      <span>{s.label}</span>
                      <span>{(s.pct * 100).toFixed(1)}%</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio table */}
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 20 }}>
              Your Portfolio
            </div>
            <div className="small">
              Live portfolio snapshot with simulated analytics.
            </div>
          </div>

          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 740,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    background: "rgba(109,92,255,.10)",
                  }}
                >
                  <th>Asset</th>
                  <th>Qty</th>
                  <th>Avg Buy</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>P/L</th>
                </tr>
              </thead>

              <tbody>
                {(portfolio?.holdings || []).map((h) => {
                  const value = h.qty * h.price;
                  const cost = h.qty * h.avgBuy;
                  const diff = value - cost;

                  return (
                    <tr key={h.symbol}>
                      <td>
                        <div style={{ fontWeight: 900 }}>{h.name}</div>
                        <div className="small">{h.symbol}</div>
                      </td>
                      <td>{h.qty}</td>
                      <td style={{ color: "var(--muted)" }}>
                        {money(h.avgBuy)}
                      </td>
                      <td style={{ fontWeight: 900 }}>
                        {money(h.price)}
                      </td>
                      <td style={{ fontWeight: 900 }}>
                        {money(value)}
                      </td>
                      <td style={{ fontWeight: 900 }}>
                        <span
                          style={{
                            color:
                              diff >= 0 ? "var(--brand2)" : "#ff5c7a",
                          }}
                        >
                          {diff >= 0 ? "+" : ""}
                          {money(diff)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn btn-ghost" to="/markets">
              Browse markets
            </Link>
            <Link className="btn btn-primary" to="/trade">
              Start a trade
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
