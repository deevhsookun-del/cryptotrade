import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { CandlestickSeries, createChart } from "lightweight-charts";
import { getSocket } from "../api/socket";

function money(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function compact(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

function hashString(value) {
  const str = String(value || "");
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seeded(seed, idx) {
  const x = Math.sin(seed * 0.0001 + idx * 12.345) * 10000;
  return x - Math.floor(x);
}

function buildBook(basePrice, symbol) {
  if (!basePrice || !Number.isFinite(basePrice)) {
    return { bids: [], asks: [], spread: 0, mid: 0, tape: [] };
  }

  const seed = hashString(symbol);
  const levels = 8;
  const spread = basePrice * (0.0008 + seeded(seed, 1) * 0.0012);
  const bids = [];
  const asks = [];

  for (let i = 0; i < levels; i += 1) {
    const depth = basePrice * (0.0015 + seeded(seed, i + 2) * 0.002) * (i + 1);
    const bidPrice = basePrice - (spread / 2 + depth);
    const askPrice = basePrice + (spread / 2 + depth);
    const bidQty = (seeded(seed, i + 30) * 2 + 0.15) * (1 + i * 0.15);
    const askQty = (seeded(seed, i + 60) * 2 + 0.15) * (1 + i * 0.15);
    bids.push({ price: bidPrice, qty: Number(bidQty.toFixed(6)), total: bidPrice * bidQty });
    asks.push({ price: askPrice, qty: Number(askQty.toFixed(6)), total: askPrice * askQty });
  }

  const tape = Array.from({ length: 10 }).map((_, i) => {
    const side = i % 2 === 0 ? "BUY" : "SELL";
    const price =
      basePrice +
      (side === "BUY" ? -1 : 1) *
        basePrice *
        (0.0005 + seeded(seed, i + 90) * 0.0012);
    const qty = (seeded(seed, i + 120) * 1.5 + 0.05).toFixed(6);
    return {
      side,
      price,
      qty: Number(qty),
      ts: Date.now() - i * 90 * 1000,
    };
  });

  return { bids, asks, spread, mid: basePrice, tape };
}

function buildMarketStats(basePrice, symbol) {
  if (!basePrice || !Number.isFinite(basePrice)) {
    return { changePct: 0, rangeHigh: 0, rangeLow: 0, volume: 0, volatility: 0 };
  }
  const seed = hashString(symbol);
  const changePct = (seeded(seed, 3) - 0.5) * 6;
  const swing = Math.abs(changePct) * 0.6 + 1.2;
  const rangeHigh = basePrice * (1 + swing / 100);
  const rangeLow = basePrice * (1 - swing / 100);
  const volume = basePrice * (seeded(seed, 10) * 8000 + 1200);
  const volatility = (seeded(seed, 12) * 2 + 0.8).toFixed(2);
  return { changePct, rangeHigh, rangeLow, volume, volatility };
}

export default function Trade({ mode = "DEMO", title = "Trade" }) {
  const { user } = useAuth();
  const [markets, setMarkets] = useState([]);
  const [portfolio, setPortfolio] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState("BUY"); // BUY | SELL
  const [qty, setQty] = useState("");
  const [futuresDir, setFuturesDir] = useState("UP"); // UP | DOWN
  const [futuresStake, setFuturesStake] = useState("100");
  const [futuresLev, setFuturesLev] = useState("5");
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [priceSeriesMap, setPriceSeriesMap] = useState({});
  const [autoRunning, setAutoRunning] = useState(false);
  const [rangeGain, setRangeGain] = useState("24h");
  const [chartRange, setChartRange] = useState("1D");
  const autoRef = useRef(null);
  const chartRef = useRef(null);
  const chartSeriesRef = useRef(null);
  const chartWrapRef = useRef(null);

  // ✅ NEW: Trades filters
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | BUY | SELL
  const [rangeFilter, setRangeFilter] = useState("ALL"); // ALL | 24H | 7D | 30D

  const selected = useMemo(() => {
    const q = String(symbol || "").toUpperCase();
    return markets.find((m) => m.symbol === q) || null;
  }, [markets, symbol]);

  const holding = useMemo(() => {
    const q = String(symbol || "").toUpperCase();
    return (portfolio?.holdings || []).find((h) => h.symbol === q) || null;
  }, [portfolio, symbol]);

  const availableQty = holding?.qty || 0;
  const cashUSD = portfolio?.cashUSD || 0;
  const price = selected?.price || 0;
  const book = useMemo(() => buildBook(price, symbol), [price, symbol]);
  const stats = useMemo(() => buildMarketStats(price, symbol), [price, symbol]);

  const futuresKey = useMemo(
    () => `cryptotrade:futures:${mode}:${user?.id || "guest"}`,
    [mode, user?.id]
  );

  const maxBuyQty = price > 0 ? cashUSD / price : 0;
  const maxSellQty = availableQty;

  const qtyNum = Number(qty);
  const qtyValid = Number.isFinite(qtyNum) && qtyNum > 0;
  const sellTooMuch = side === "SELL" && qtyValid && qtyNum > maxSellQty;

  // ✅ NEW: Export CSV
  function exportTradesCSV(trades) {
    const rows = Array.isArray(trades) ? trades : [];
    const header = ["type", "symbol", "qty", "price", "total", "timestamp"];
    const lines = [header.join(",")];

    for (const t of rows) {
      const line = [
        t.type,
        t.symbol,
        t.qty,
        t.price,
        t.total,
        new Date(t.ts).toISOString(),
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",");
      lines.push(line);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cryptotrade-trades.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ✅ NEW: Filtered trades
  const filteredTrades = useMemo(() => {
    const list = Array.isArray(portfolio?.trades) ? portfolio.trades : [];
    const now = Date.now();

    const minTs =
      rangeFilter === "24H"
        ? now - 24 * 60 * 60 * 1000
        : rangeFilter === "7D"
        ? now - 7 * 24 * 60 * 60 * 1000
        : rangeFilter === "30D"
        ? now - 30 * 24 * 60 * 60 * 1000
        : 0;

    return list.filter((t) => {
      const okType = typeFilter === "ALL" || t.type === typeFilter;
      const okRange = !minTs || Number(t.ts) >= minTs;
      return okType && okRange;
    });
  }, [portfolio, typeFilter, rangeFilter]);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [mRes, pRes] = await Promise.all([
        api.get("/markets?perPage=100&page=1"),
        api.get(`/trades/portfolio?mode=${encodeURIComponent(mode)}`),
      ]);

      setMarkets(Array.isArray(mRes.data) ? mRes.data : []);
      setPortfolio(pRes.data);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load trade data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // When user selects SELL, auto-pick a coin they own (if current symbol not owned)
  useEffect(() => {
    if (side !== "SELL") return;

    const owned = (portfolio?.holdings || []).filter((h) => h.qty > 0);
    if (owned.length === 0) return;

    const currentOwned = owned.some((h) => h.symbol === String(symbol).toUpperCase());
    if (!currentOwned) setSymbol(owned[0].symbol);
  }, [side, portfolio, symbol]);

  useEffect(() => {
    loadAll();

    const t = setInterval(async () => {
      try {
        const mRes = await api.get("/markets?perPage=100&page=1");
        setMarkets(Array.isArray(mRes.data) ? mRes.data : []);
      } catch {
        // ignore background refresh errors
      }
    }, 20000);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onMarkets = (data) => {
      if (Array.isArray(data) && data.length) {
        setMarkets(data);
        const now = Math.floor(Date.now() / 1000);
        setPriceSeriesMap((prev) => {
          const next = { ...prev };
          data.forEach((m) => {
            const key = m.symbol;
            const arr = Array.isArray(next[key]) ? [...next[key]] : [];
            arr.push({ time: now, value: Number(m.price || 0) });
            if (arr.length > 120) arr.splice(0, arr.length - 120);
            next[key] = arr;
          });
          return next;
        });
      }
    };

    const onPortfolio = (payload) => {
      if (payload?.mode === mode && payload?.portfolio) {
        setPortfolio(payload.portfolio);
      }
    };

    socket.on("markets", onMarkets);
    socket.on("portfolio", onPortfolio);
    return () => {
      socket.off("markets", onMarkets);
      socket.off("portfolio", onPortfolio);
    };
  }, [mode]);

  function buildCandles(series, pointsPerCandle = 4) {
    if (!series.length) return [];
    const out = [];
    for (let i = 0; i < series.length; i += pointsPerCandle) {
      const chunk = series.slice(i, i + pointsPerCandle);
      if (!chunk.length) continue;
      const open = chunk[0].value;
      const close = chunk[chunk.length - 1].value;
      const high = Math.max(...chunk.map((c) => c.value));
      const low = Math.min(...chunk.map((c) => c.value));
      out.push({
        time: chunk[chunk.length - 1].time,
        open,
        high,
        low,
        close,
      });
    }
    return out;
  }

  function synthCandles(basePrice, symbol, count = 40) {
    if (!basePrice || !Number.isFinite(basePrice)) return [];
    const seed = hashString(symbol);
    const out = [];
    let priceNow = basePrice;
    const now = Math.floor(Date.now() / 1000);
    for (let i = count; i > 0; i -= 1) {
      const drift = (seeded(seed, i) - 0.5) * basePrice * 0.01;
      const open = priceNow;
      const close = Math.max(0.0001, open + drift);
      const high = Math.max(open, close) + Math.abs(drift) * 0.6;
      const low = Math.min(open, close) - Math.abs(drift) * 0.6;
      out.push({
        time: now - i * 60,
        open,
        high,
        low,
        close,
      });
      priceNow = close;
    }
    return out;
  }

  function buildCandlesForRange(range, series, basePrice, symbol) {
    const live = Array.isArray(series) ? series : [];
    if (live.length) {
      const perCandle =
        range === "1D" ? 4 : range === "7D" ? 6 : range === "1M" ? 8 : range === "1Y" ? 12 : 10;
      return buildCandles(live, perCandle);
    }

    const count =
      range === "1D"
        ? 48
        : range === "7D"
        ? 70
        : range === "1M"
        ? 90
        : range === "1Y"
        ? 120
        : 100;
    return synthCandles(basePrice, symbol, count);
  }

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

    chartSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#35d07f",
      downColor: "#ff5c7a",
      borderUpColor: "#35d07f",
      borderDownColor: "#ff5c7a",
      wickUpColor: "#35d07f",
      wickDownColor: "#ff5c7a",
    });

    chartSeriesRef.current.priceScale().applyOptions({
      borderColor: "rgba(255,255,255,0.15)",
    });

    chartRef.current.timeScale().applyOptions({
      rightOffset: 2,
      barSpacing: 6,
      borderColor: "rgba(255,255,255,0.15)",
    });

    const ro = new ResizeObserver(() => {
      if (!chartRef.current || !chartWrapRef.current) return;
      const { width, height } = chartWrapRef.current.getBoundingClientRect();
      if (width && height) chartRef.current.resize(width, height);
    });
    ro.observe(chartWrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!chartSeriesRef.current) return;
    const series = priceSeriesMap[symbol] || [];
    const candles = buildCandlesForRange(chartRange, series, price, symbol);
    if (candles.length) {
      chartSeriesRef.current.setData(candles);
      chartRef.current?.timeScale().fitContent();
    }
  }, [priceSeriesMap, symbol, price, chartRange]);

  useEffect(() => {
    const raw = localStorage.getItem(futuresKey);
    if (raw) {
      try {
        setFuturesPositions(JSON.parse(raw));
      } catch {
        setFuturesPositions([]);
      }
    }
  }, [futuresKey]);

  function persistFutures(next) {
    setFuturesPositions(next);
    localStorage.setItem(futuresKey, JSON.stringify(next));
  }

  async function submitTrade() {
    try {
      setError("");

      const q = Number(qty);
      if (!symbol) return setError("Please choose an asset.");
      if (!Number.isFinite(q) || q <= 0) return setError("Qty must be a number > 0");
      if (side === "SELL" && q > maxSellQty) return setError(`You can’t sell more than you own (${maxSellQty} ${symbol})`);

      const endpoint = side === "BUY" ? "/trades/buy" : "/trades/sell";
      const res = await api.post(`${endpoint}?mode=${encodeURIComponent(mode)}`, { symbol, qty: q });

      setPortfolio(res.data.portfolio);
      setQty("");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Trade failed";
      setError(msg);
    }
  }

  function openFutures() {
    setError("");
    const stake = Number(futuresStake);
    const lev = Number(futuresLev);
    if (!selected) return setError("Please choose an asset.");
    if (!Number.isFinite(stake) || stake <= 0) return setError("Stake must be > 0");
    if (!Number.isFinite(lev) || lev <= 0) return setError("Leverage must be > 0");
    if (!price) return setError("Price unavailable. Try again.");

    const pos = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      symbol: selected.symbol,
      name: selected.name,
      direction: futuresDir,
      stakeUSD: stake,
      leverage: lev,
      entryPrice: price,
      openedAt: Date.now(),
      status: "OPEN",
    };

    persistFutures([pos, ...futuresPositions]);
  }

  function closeFutures(id) {
    const next = futuresPositions.map((p) => {
      if (p.id !== id || p.status !== "OPEN") return p;
      const current = selected?.symbol === p.symbol ? price : p.entryPrice;
      const diff = (current - p.entryPrice) / p.entryPrice;
      const pnl = p.direction === "UP" ? p.stakeUSD * p.leverage * diff : p.stakeUSD * p.leverage * -diff;
      return {
        ...p,
        status: "CLOSED",
        closedAt: Date.now(),
        exitPrice: current,
        pnl,
      };
    });

    persistFutures(next);
  }

  function livePnl(p) {
    if (p.status !== "OPEN") return p.pnl || 0;
    const current = selected?.symbol === p.symbol ? price : p.entryPrice;
    const diff = (current - p.entryPrice) / p.entryPrice;
    return p.direction === "UP" ? p.stakeUSD * p.leverage * diff : p.stakeUSD * p.leverage * -diff;
  }

  async function runAutoTrade() {
    if (!selected || !portfolio) return;
    const current = selected.price || 0;
    if (!current) return;

    const lastSeries = priceSeriesMap[selected.symbol] || [];
    const prev = lastSeries.length > 1 ? lastSeries[lastSeries.length - 2].value : current;
    const direction = current >= prev ? "BUY" : "SELL";
    const cash = portfolio.cashUSD || 0;
    const holding = (portfolio.holdings || []).find((h) => h.symbol === selected.symbol);
    const maxBuy = current > 0 ? cash / current : 0;
    const buyQty = Math.max(0, maxBuy * 0.01);
    const sellQty = holding ? holding.qty * 0.1 : 0;

    try {
      if (direction === "BUY" && buyQty > 0) {
        const res = await api.post(`/trades/buy?mode=${encodeURIComponent(mode)}`, {
          symbol: selected.symbol,
          qty: Number(buyQty.toFixed(6)),
        });
        setPortfolio(res.data.portfolio);
      } else if (direction === "SELL" && sellQty > 0) {
        const res = await api.post(`/trades/sell?mode=${encodeURIComponent(mode)}`, {
          symbol: selected.symbol,
          qty: Number(sellQty.toFixed(6)),
        });
        setPortfolio(res.data.portfolio);
      }
    } catch {
      // ignore auto trade errors
    }
  }

  useEffect(() => {
    if (!autoRunning) return;
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(runAutoTrade, 8000);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [autoRunning, selected, portfolio, priceSeriesMap, mode]);

  return (
    <div className="section tradeShell">
      <div className="card tradeHeader" style={{ padding: 18 }}>
        <div className="tradeHeaderRow">
          <div>
            <h1 style={{ margin: 0 }}>{title}</h1>
            <div className="p" style={{ marginTop: 6 }}>
              {mode === "REAL"
                ? "Trade using your funded balance (simulated exchange flow). Deposit first, then buy/sell at live prices."
                : "Demo buy/sell using live market prices. Portfolio updates instantly."}
            </div>
          </div>

          <div className="row">
            <button className="btn btn-ghost" onClick={loadAll} type="button">
              Refresh
            </button>
            <Link className="btn btn-primary" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        {loading && <div className="p" style={{ marginTop: 14 }}>Loading trade engine…</div>}
        {error && <div className="p" style={{ marginTop: 14 }}>❌ {error}</div>}

        {!loading && !error && (
          <>
            {/* Portfolio summary */}
            <div className="grid3 tradeStats" style={{ marginTop: 14 }}>
              <div className="card tradeStatCard" style={{ padding: 14 }}>
                <div className="small">Cash (USD)</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(portfolio?.cashUSD)}</div>
              </div>

              <div className="card tradeStatCard" style={{ padding: 14 }}>
                <div className="small">Holdings Value</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(portfolio?.holdingsValue)}</div>
              </div>

              <div className="card tradeStatCard" style={{ padding: 14 }}>
                <div className="small">Total (USD)</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(portfolio?.totalUSD)}</div>
              </div>
            </div>

            {/* Market snapshot */}
            <div className="grid2 tradeMarketGrid" style={{ marginTop: 14 }}>
              <div className="card tradePanel" style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 1000, fontSize: 18 }}>
                      {selected ? `${selected.name} (${selected.symbol})` : "Market Snapshot"}
                    </div>
                    <div className="small" style={{ marginTop: 4 }}>
                      Live pricing • Updated every 20s
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 1000, fontSize: 20 }}>{money(price)}</div>
                    <div
                      className="small"
                      style={{
                        color: stats.changePct >= 0 ? "var(--brand2)" : "#ff5c7a",
                        fontWeight: 800,
                      }}
                    >
                      {stats.changePct >= 0 ? "+" : ""}
                      {stats.changePct.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 10, justifyContent: "space-between", gap: 10 }}>
                  <div className="small" style={{ fontWeight: 900 }}>Time range</div>
                  <div className="row" style={{ gap: 6 }}>
                    {["1D", "7D", "1M", "1Y", "ALL"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={"btn " + (chartRange === r ? "btn-primary" : "btn-ghost")}
                        style={{ padding: "6px 10px" }}
                        onClick={() => setChartRange(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chartPlaceholder" ref={chartWrapRef}>
                  <div className="small chartLabel">Candlestick chart</div>
                </div>

                <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
                  <div className="small" style={{ fontWeight: 900 }}>
                    Gain period
                  </div>
                  <select
                    className="input"
                    style={{ maxWidth: 180 }}
                    value={rangeGain}
                    onChange={(e) => setRangeGain(e.target.value)}
                  >
                    <option value="24h">24h</option>
                    <option value="1w">1 week</option>
                    <option value="1m">1 month</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>

                <div className="grid3" style={{ marginTop: 12 }}>
                  <div className="card" style={{ padding: 12 }}>
                    <div className="small">{rangeGain} High</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>{money(stats.rangeHigh)}</div>
                  </div>
                  <div className="card" style={{ padding: 12 }}>
                    <div className="small">{rangeGain} Low</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>{money(stats.rangeLow)}</div>
                  </div>
                  <div className="card" style={{ padding: 12 }}>
                    <div className="small">{rangeGain} Volume</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>{compact(stats.volume)}</div>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 12 }}>
                  <div className="pill">Volatility: {stats.volatility}%</div>
                  <div className="pill">Spread: {money(book.spread)}</div>
                </div>
              </div>

              <div className="card tradePanel" style={{ padding: 16 }}>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>Market insights</div>
                <div className="small" style={{ marginTop: 6 }}>
                  Advanced order book and tape are hidden for a cleaner view.
                </div>
                <div className="small" style={{ marginTop: 12 }}>
                  Use the chart, stats, and trading form to make decisions.
                </div>
              </div>
            </div>

            {/* Trade form */}
            <div className="card tradePanel" style={{ marginTop: 14, padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>Place a trade</div>
              <div className="small" style={{ marginTop: 6 }}>
                Price used: {selected ? `${selected.name} (${selected.symbol}) @ ${money(selected.price)}` : "—"}
              </div>

              <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 220 }}>
                  <div className="label">Asset</div>
                  <select className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                    {markets.map((m) => (
                      <option key={m.id} value={m.symbol}>
                        {m.symbol} — {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: 160 }}>
                  <div className="label">Side</div>
                  <select className="input" value={side} onChange={(e) => setSide(e.target.value)}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div style={{ minWidth: 160 }}>
                  <div className="label">Qty</div>
                  <input
                    className="input"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="e.g. 0.01"
                    inputMode="decimal"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitTrade();
                    }}
                  />

                  <div className="small" style={{ marginTop: 8 }}>
                    You have: <strong>{availableQty || 0}</strong> {symbol}
                  </div>

                  <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setQty((Math.max(0, maxBuyQty) * 0.25).toFixed(6))}
                      disabled={!selected}
                    >
                      25% BUY
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setQty(Math.max(0, maxBuyQty).toFixed(6))}
                      disabled={!selected}
                    >
                      Max BUY
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setQty(Math.max(0, maxSellQty).toFixed(6))}
                      disabled={!selected || maxSellQty <= 0}
                    >
                      Max SELL
                    </button>
                  </div>

                  {sellTooMuch && (
                    <div className="p" style={{ marginTop: 10 }}>
                      ❌ You can’t sell more than you own ({maxSellQty} {symbol})
                    </div>
                  )}
                </div>

                <div style={{ alignSelf: "end" }}>
                  <button className="btn btn-primary" type="button" onClick={submitTrade} disabled={!selected || !qtyValid || sellTooMuch}>
                    Submit
                  </button>
                </div>
              </div>

              {selected && qty && Number(qty) > 0 && (
                <div className="small" style={{ marginTop: 10 }}>
                  Est. {side === "BUY" ? "Cost" : "Proceeds"}: <strong>{money(Number(qty) * Number(selected.price))}</strong>
                </div>
              )}
            </div>

            {/* Futures / Prediction trading */}
            <div className="card tradePanel" style={{ marginTop: 14, padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>Futures (Prediction)</div>
              <div className="small" style={{ marginTop: 6 }}>
                Predict whether the price will go <strong>up</strong> or <strong>down</strong>. Simulated only.
              </div>

              <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 220 }}>
                  <div className="label">Asset</div>
                  <select className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                    {markets.map((m) => (
                      <option key={m.id} value={m.symbol}>
                        {m.symbol} — {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: 160 }}>
                  <div className="label">Direction</div>
                  <select className="input" value={futuresDir} onChange={(e) => setFuturesDir(e.target.value)}>
                    <option value="UP">UP</option>
                    <option value="DOWN">DOWN</option>
                  </select>
                </div>

                <div style={{ minWidth: 160 }}>
                  <div className="label">Stake (USD)</div>
                  <input
                    className="input"
                    value={futuresStake}
                    onChange={(e) => setFuturesStake(e.target.value)}
                    inputMode="decimal"
                    placeholder="100"
                  />
                </div>

                <div style={{ minWidth: 140 }}>
                  <div className="label">Leverage</div>
                  <select className="input" value={futuresLev} onChange={(e) => setFuturesLev(e.target.value)}>
                    <option value="2">2x</option>
                    <option value="5">5x</option>
                    <option value="10">10x</option>
                    <option value="20">20x</option>
                  </select>
                </div>

                <div style={{ alignSelf: "end" }}>
                  <button className="btn btn-primary" type="button" onClick={openFutures}>
                    Open Position
                  </button>
                </div>
              </div>

              <div className="small" style={{ marginTop: 10 }}>
                Entry price: <strong>{money(price)}</strong> • Mode: <strong>{mode}</strong>
              </div>

              <div className="divider" style={{ marginTop: 12 }} />
              <div style={{ fontWeight: 900, marginTop: 12 }}>Positions</div>
              <div className="small" style={{ marginTop: 8, lineHeight: 1.7 }}>
                {futuresPositions.length === 0 ? (
                  "No prediction positions yet."
                ) : (
                  futuresPositions.map((p) => {
                    const pnl = livePnl(p);
                    return (
                      <div key={p.id} className="row" style={{ justifyContent: "space-between" }}>
                        <div>
                          <strong>{p.symbol}</strong> • {p.direction} • {p.leverage}x • ${p.stakeUSD}
                          <span style={{ opacity: 0.7 }}> @ {money(p.entryPrice)}</span>
                        </div>
                        <div className="row">
                          <span
                            style={{
                              fontWeight: 900,
                              color: pnl >= 0 ? "var(--brand2)" : "#ff5c7a",
                            }}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {money(pnl)}
                          </span>
                          {p.status === "OPEN" ? (
                            <button
                              className="btn btn-ghost"
                              type="button"
                              onClick={() => closeFutures(p.id)}
                            >
                              Close
                            </button>
                          ) : (
                            <span className="small">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="divider" style={{ marginTop: 12 }} />
              <div style={{ fontWeight: 900, marginTop: 12 }}>Automated strategy (demo)</div>
              <div className="small" style={{ marginTop: 6 }}>
                Simple momentum bot that buys on upward ticks and sells on downward ticks.
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className={"btn " + (autoRunning ? "btn-ghost" : "btn-primary")}
                  type="button"
                  onClick={() => setAutoRunning(true)}
                  disabled={autoRunning}
                >
                  Start Auto
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setAutoRunning(false)}
                  disabled={!autoRunning}
                >
                  Stop Auto
                </button>
                <div className="small">
                  Trades every ~8s using ~1% cash or 10% holdings.
                </div>
              </div>
            </div>

            {/* Holdings table */}
            <div className="card tradePanel" style={{ marginTop: 14, padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>Holdings</div>

              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Asset</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Qty</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Avg Buy</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Price</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Value</th>
                      <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>P/L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(portfolio?.holdings || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="small" style={{ padding: "12px 8px" }}>
                          No holdings yet. Buy something to start.
                        </td>
                      </tr>
                    ) : (
                      portfolio.holdings.map((h) => (
                        <tr key={h.symbol}>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>
                            <div style={{ fontWeight: 900 }}>{h.name}</div>
                            <div className="small">{h.symbol}</div>
                          </td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{h.qty}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{money(h.avgBuy)}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{money(h.price)}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>{money(h.value)}</td>
                          <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
                            <span style={{ color: (h.pnl ?? 0) >= 0 ? "var(--brand2)" : "#ff5c7a" }}>
                              {(h.pnl ?? 0) >= 0 ? "+" : ""}
                              {money(h.pnl ?? 0)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trades */}
            <div className="card" style={{ marginTop: 14, padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 18 }}>Recent trades</div>

              {/* ✅ NEW: Filters + Export */}
              <div className="row" style={{ marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="ALL">All</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>

                <select className="input" value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)}>
                  <option value="ALL">All time</option>
                  <option value="24H">Last 24h</option>
                  <option value="7D">Last 7 days</option>
                  <option value="30D">Last 30 days</option>
                </select>

                <button className="btn btn-ghost" type="button" onClick={() => exportTradesCSV(filteredTrades)}>
                  Export CSV
                </button>

                <div className="small" style={{ marginLeft: "auto" }}>
                  Showing {filteredTrades.length} trade(s)
                </div>
              </div>

              <div className="small" style={{ marginTop: 8, lineHeight: 1.7 }}>
                {filteredTrades.length === 0
                  ? "No trades yet."
                  : filteredTrades.map((t, i) => (
                      <div key={i}>
                        <strong>{t.type}</strong> {t.qty} {t.symbol} @ {money(t.price)} — {money(t.total)}{" "}
                        <span style={{ opacity: 0.75 }}>({new Date(t.ts).toLocaleString()})</span>
                      </div>
                    ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
