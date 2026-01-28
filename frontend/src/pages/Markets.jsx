import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { getSocket } from "../api/socket";

export default function Markets() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 100;

  async function load(reset = false) {
    try {
      setLoading(true);
      setError("");

      const nextPage = reset ? 1 : page + 1;
      const res = await api.get(`/markets?perPage=${perPage}&page=${nextPage}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setRows((prev) => (reset ? data : [...prev, ...data]));
      setPage(nextPage);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Error loading markets";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setRows([]);
    setPage(1);
    load(true);
    const t = setInterval(() => load(true), 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onMarkets = (data) => {
      if (Array.isArray(data) && data.length) {
        setRows(data);
        setPage(1);
      }
    };
    socket.on("markets", onMarkets);
    return () => socket.off("markets", onMarkets);
  }, []);

  return (
    <div className="section">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>Markets</h1>
            <div className="p" style={{ marginTop: 6 }}>
              Live prices in USD. Auto-refreshes every 20 seconds.
            </div>
          </div>

          <div className="row">
            <button className="btn btn-ghost" onClick={() => load(true)} type="button">Refresh</button>
            <Link className="btn btn-primary" to="/dashboard">Dashboard</Link>
          </div>
        </div>

        {loading && <div className="p" style={{ marginTop: 14 }}>Loading market prices…</div>}
        {error && <div className="p" style={{ marginTop: 14 }}>❌ {error}</div>}

        {!loading && !error && (
          <div style={{ marginTop: 14 }}>
            <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Asset</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Symbol</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Price</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>24h</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>Market Cap</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const isUp = typeof r.change24h === "number" ? r.change24h >= 0 : null;

                  return (
                    <tr key={r.id}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={r.image} alt={r.name} style={{ width: 22, height: 22 }} />
                          <div style={{ fontWeight: 900 }}>{r.name}</div>
                        </div>
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontWeight: 900 }}>
                        {r.symbol}
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
                        ${Number(r.price).toLocaleString()}
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
                        {typeof r.change24h === "number" ? (
                          <span style={{ color: isUp ? "var(--brand2)" : "#ff5c7a" }}>
                            {r.change24h.toFixed(2)}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                        ${Number(r.marketCap).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
              <div className="small">
                Showing ~{rows.length} assets. Click “Load more” to fetch more (CoinGecko pages).
              </div>
              <button className="btn btn-ghost" type="button" onClick={() => load(false)} disabled={loading}>
                Load more
              </button>
            </div>
          </div>
        )}

        <div className="small" style={{ marginTop: 12 }}>
          Source: CoinGecko (proxied by backend). Prices may be delayed.
        </div>
      </div>
    </div>
  );
}
