import { Link } from "react-router-dom";

const heroImg =
  "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1400&q=80"; // crypto / tech
const dashboardImg =
  "https://images.unsplash.com/photo-1642790106466-6bba4b43b437?auto=format&fit=crop&w=1400&q=80"; // screens / data
const learnImg =
  "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1400&q=80"; // blockchain vibe

const coins = [
  { name: "Bitcoin", symbol: "BTC", img: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035" },
  { name: "Ethereum", symbol: "ETH", img: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035" },
  { name: "BNB", symbol: "BNB", img: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=035" },
  { name: "Solana", symbol: "SOL", img: "https://cryptologos.cc/logos/solana-sol-logo.png?v=035" },
  { name: "XRP", symbol: "XRP", img: "https://cryptologos.cc/logos/xrp-xrp-logo.png?v=035" },
];

function FeatureCard({ title, text }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div className="p" style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
}

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <div
              style={{
                display: "inline-flex",
                gap: 10,
                alignItems: "center",
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "10px 12px",
                background: "rgba(109,92,255,.08)",
                fontWeight: 900,
              }}
            >
              ✨ CryptoTrade Exchange
            </div>

            <h1 className="h1" style={{ marginTop: 14 }}>
              Crypto made simple.
            </h1>

            <p className="p">
              A clean, interactive demo trading platform built for learning. Explore markets,
              practice buy/sell trades with virtual funds, track your portfolio, and review history —
              all in a modern interface.
            </p>

            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn btn-primary" to="/register">
                Create account
              </Link>
              <Link className="btn btn-ghost" to="/learn">
                Learn crypto
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Use demo
              </Link>
            </div>

            <div className="p" style={{ marginTop: 14, fontSize: 13 }}>
            portfolio + markets + simulated trades + real-time prices + charts + automation
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <img
              src={heroImg}
              alt="Crypto trading"
              style={{ width: "100%", height: "100%", minHeight: 320, objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* COIN LOGOS */}
      <section className="section">
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Popular assets</div>
          <div
  className="coinGridFix"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10,
  }}
>

            {coins.map((c) => (
              <div
                key={c.symbol}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,.04)",
                }}
              >
                <img src={c.img} alt={c.name} style={{ width: 26, height: 26 }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{c.symbol}</div>
                  <div className="p" style={{ fontSize: 12 }}>{c.name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* mobile fix */}
          <div className="p" style={{ marginTop: 10, fontSize: 12 }}>
            logo of some cryptocurrencies.
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>Built to feel like a real exchange</div>
            <div className="p" style={{ marginTop: 6 }}>
              Simple navigation, responsive design, and clear feedback after every action.
            </div>
          </div>
          <Link className="btn btn-primary" to="/dashboard">
            Go to dashboard
          </Link>
        </div>

        <div className="grid3" style={{ marginTop: 14 }}>
          <FeatureCard
            title="Markets"
            text="Browse top coins, view price changes, and prepare trades with confidence."
          />
          <FeatureCard
            title="Simulated Trading"
            text="Buy/sell using virtual funds. No real money — perfect for practice."
          />
          <FeatureCard
            title="Portfolio Tracking"
            text="See balances, positions, and performance clearly in one place."
          />
        </div>
      </section>

      {/* LEARN CRYPTO PREVIEW */}
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ overflow: "hidden" }}>
            <img
              src={learnImg}
              alt="Learn cryptocurrency"
              style={{ width: "100%", height: "100%", minHeight: 280, objectFit: "cover" }}
            />
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 22 }}>New to crypto?</div>
            <p className="p" style={{ marginTop: 10 }}>
              Visit the Learn page to understand what cryptocurrency is, how blockchain works,
              and how to use wallets safely. We also embed a recommended YouTube video to help you start.
            </p>

            <div className="row" style={{ marginTop: 14 }}>
              <Link className="btn btn-primary" to="/learn">Start learning</Link>
              <Link className="btn btn-ghost" to="/contact">Contact support</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW (replaces unreliable external preview image) */}
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 1000, fontSize: 22 }}>Dashboard Preview</div>
              <div className="p" style={{ marginTop: 6 }}>
                A clean exchange-style dashboard: balance KPIs, holdings, recent trades, and quick actions.
              </div>
            </div>
            <div className="row">
              <Link className="btn btn-primary" to="/register">Create account</Link>
              <Link className="btn btn-ghost" to="/login">Login</Link>
            </div>
          </div>

          <div className="grid4" style={{ marginTop: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="small">Total Balance</div>
              <div style={{ fontWeight: 1000, fontSize: 22, marginTop: 6 }}>$12,450.20</div>
              <div className="small" style={{ marginTop: 6 }}>Demo example</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="small">Holdings Value</div>
              <div style={{ fontWeight: 1000, fontSize: 22, marginTop: 6 }}>$4,103.10</div>
              <div className="small" style={{ marginTop: 6 }}>Real-time pricing</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="small">24h P/L</div>
              <div style={{ fontWeight: 1000, fontSize: 22, marginTop: 6 }}>+2.18%</div>
              <div className="small" style={{ marginTop: 6 }}>Snapshot</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="small">Quick Actions</div>
              <div className="row" style={{ marginTop: 10 }}>
                <Link className="btn btn-ghost" to="/markets">Markets</Link>
                <Link className="btn btn-ghost" to="/trade">Trade</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
