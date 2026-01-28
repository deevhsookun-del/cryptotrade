import { Link } from "react-router-dom";

function Tile({ title, text }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div className="p" style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
}

function Video({ title, src }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: 14, borderBottom: "1px solid var(--line)", fontWeight: 900 }}>
        {title}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)" }}>
          <iframe
            width="100%"
            height="380"
            src={src}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function Learn() {
  const topics = [
    {
      title: "What is cryptocurrency?",
      text: "A decentralized digital currency secured by cryptography. It operates without a central bank and uses a shared ledger for transparency.",
    },
    {
      title: "Purpose vs traditional money",
      text: "Crypto is designed for peer-to-peer value transfer and programmable finance, while traditional money relies on banks and central authorities.",
    },
    {
      title: "Blockchain & distributed ledgers",
      text: "Blockchains are shared databases where transactions are bundled into blocks and verified across a network of computers.",
    },
    {
      title: "How transactions work",
      text: "Wallets use public/private keys to sign transactions. Networks confirm them, then they’re added to the blockchain ledger.",
    },
    {
      title: "Consensus (PoW & PoS)",
      text: "Proof of Work uses mining to secure the network; Proof of Stake uses staked funds and validators to confirm transactions.",
    },
    {
      title: "Types of crypto assets",
      text: "Coins run on their own chains (e.g., BTC). Tokens run on existing chains. Stablecoins aim to track fiat value.",
    },
    {
      title: "Wallets & storage",
      text: "Hot wallets are online and convenient; cold wallets are offline and safer. Custodial wallets are managed by platforms.",
    },
    {
      title: "Trading basics",
      text: "Exchanges match buy/sell orders. Spot trading uses immediate settlement. Volatility can amplify gains and losses.",
    },
    {
      title: "Security risks & scams",
      text: "Common risks include phishing, fake support, and suspicious airdrops. Always verify links and use 2FA.",
    },
    {
      title: "Real-world use cases",
      text: "Crypto powers payments, smart contracts, DeFi lending, and digital ownership without traditional intermediaries.",
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "10px 12px",
              background: "rgba(109,92,255,.10)",
              fontWeight: 900,
            }}
          >
            📘 Learn • Crypto Basics
          </div>

          <h1 className="h1" style={{ marginTop: 14 }}>
            Learn crypto the simple way
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            Cryptocurrency is a digital asset secured by cryptography and run on public blockchains.
            It enables borderless value transfer, programmable finance, and new online economies.
          </p>

          <div className="row" style={{ marginTop: 16 }}>
            <Link className="btn btn-primary" to="/register">Create demo account</Link>
            <Link className="btn btn-ghost" to="/">Back to home</Link>
          </div>
        </div>
      </section>

      {/* Core concepts */}
      <section className="section">
        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 10 }}>
          Crypto fundamentals (explained clearly)
        </div>

        <div className="grid2">
          {topics.map((t) => (
            <Tile key={t.title} title={t.title} text={t.text} />
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Safety checklist</div>
            <ul className="p" style={{ marginTop: 10, lineHeight: 1.75 }}>
              <li><strong>Never</strong> share your seed phrase or private keys.</li>
              <li>Use strong passwords and enable 2FA on real exchanges.</li>
              <li>Be careful with “too good to be true” offers and fake links.</li>
              <li>Start with demo/paper trading before risking money.</li>
              <li>Learn risk management: position sizing, stop-loss, and planning.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>How CryptoTrade helps</div>
            <p className="p" style={{ marginTop: 10 }}>
              CryptoTrade is built for practice. You’ll use a <strong>demo balance</strong>, simulate buy/sell trades,
              and review your history like a real platform — but without the risk of losing real money.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <Link className="btn btn-primary" to="/login">Use demo</Link>
              <Link className="btn btn-ghost" to="/contact">Ask support</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="section">
        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 10 }}>
          Watch & learn (recommended videos)
        </div>

        <div className="grid2">
          <Video
            title="Crypto explained (overview)"
            src="https://www.youtube.com/embed/rYQgy8QDEBI"
          />
          <Video
            title="Blockchain basics (visual guide)"
            src="https://www.youtube.com/embed/evAJW38orgM"
          />
          <Video
            title="Crypto trading essentials"
            src="https://www.youtube.com/embed/BNYvbwmrjoA"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Ready to practice?</div>
          <p className="p" style={{ marginTop: 8 }}>
            Start with a demo account, explore markets, and try your first simulated trade.
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn btn-primary" to="/register">Start demo trading</Link>
            <Link className="btn btn-ghost" to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
