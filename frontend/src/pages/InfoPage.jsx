import { Link, useParams } from "react-router-dom";
import { IMAGES } from "../assets/images";

const GROUP_CONTENT = {
  products: {
    summary:
      "Product pages explain how each feature works inside CryptoTrade and what you can expect in Demo vs Real mode. Use these guides to understand execution flow, risks, and best practices before placing trades.",
    details: [
      "You will see where the feature appears in the UI, what inputs are required, and how results are recorded in your portfolio or activity history.",
      "We highlight key risks, common mistakes, and tips to keep your actions controlled and repeatable.",
    ],
    visuals: [
      { label: "Execution", value: "Instant" },
      { label: "Mode", value: "Demo / Real" },
      { label: "Risk", value: "Medium–High" },
    ],
    faqs: [
      { q: "Is this real trading?", a: "No. The project is a safe simulation for academic purposes." },
      { q: "Do I need a deposit?", a: "Real mode requires a simulated deposit; demo mode is funded." },
    ],
  },
  education: {
    summary:
      "Education pages break down concepts from beginner to intermediate level. Each topic is structured with definitions, examples, and practical tips you can apply in demo trading.",
    details: [
      "Use these lessons to build strong foundations before risking capital on real platforms.",
      "We keep explanations short, practical, and focused on decision‑making.",
    ],
    visuals: [
      { label: "Difficulty", value: "Beginner+" },
      { label: "Format", value: "Guides" },
      { label: "Outcome", value: "Confidence" },
    ],
    faqs: [
      { q: "Where should I start?", a: "Begin with “What is Cryptocurrency” and “Trading Tips.”" },
      { q: "How can I practice?", a: "Use the Demo page to simulate actions." },
    ],
  },
  fees: {
    summary:
      "Fee pages explain how deposits, withdrawals, and trading costs typically work on real exchanges. These are informational only and not charged on this demo.",
    details: [
      "We outline fee types, how they’re calculated, and what actions trigger them.",
      "The goal is to make you fee‑aware before you trade on real platforms.",
    ],
    visuals: [
      { label: "Visibility", value: "Transparent" },
      { label: "Impact", value: "Compounds" },
      { label: "Tip", value: "Compare fees" },
    ],
    faqs: [
      { q: "Do fees apply here?", a: "No. This is a demo; fees are explained only." },
      { q: "Why learn fees?", a: "Fees affect long‑term performance significantly." },
    ],
  },
  company: {
    summary:
      "Company pages describe the project’s purpose, quality standards, and legal disclaimers. These pages make the platform feel professional and complete.",
    details: [
      "We emphasize reliability, transparency, and a clear educational mission.",
      "All content is tailored for an academic trading simulation.",
    ],
    visuals: [
      { label: "Mission", value: "Education" },
      { label: "Focus", value: "Clarity" },
      { label: "Status", value: "Student Project" },
    ],
    faqs: [
      { q: "Is this a real exchange?", a: "No. It’s a demo platform for learning." },
      { q: "Do you handle real funds?", a: "No real funds are processed." },
    ],
  },
  faq: {
    summary:
      "Support pages answer common questions and explain how to resolve issues. Use these pages before contacting support.",
    details: [
      "We include guidance on logins, deposits, and trade execution in Demo and Real modes.",
      "If you still need help, use the Contact page.",
    ],
    visuals: [
      { label: "Response", value: "Quick" },
      { label: "Help", value: "Guided" },
      { label: "Scope", value: "Platform" },
    ],
    faqs: [
      { q: "Where is support?", a: "Use the Contact page or Support Desk." },
      { q: "How do I reset a password?", a: "Use Forgot Password on the Login page." },
    ],
  },
};

const SUMMARIES = {
  "spot": "Spot trading is the simplest form of crypto trading—buying or selling the actual asset at the current market price.",
  "futures": "Futures allow you to speculate on price direction with leverage, which can amplify both gains and losses.",
  "referral-program": "Referral programs reward users for inviting friends, often through fee discounts or bonuses.",
  "buy-bitcoin": "A practical guide to purchasing Bitcoin using the Real mode flow inside CryptoTrade.",
  "buy-ethereum": "A practical guide to purchasing Ethereum using the Real mode flow inside CryptoTrade.",
  "trading-tips": "Short, actionable tips to help you trade more safely and consistently.",
  "trading-tutorials": "Structured tutorials that explain order types, market signals, and execution flow.",
  "what-is-cryptocurrency": "A concise overview of what cryptocurrency is and why it matters.",
  "how-to-invest": "An investment‑style framework for allocating capital, managing risk, and thinking long‑term.",
  "crypto-changes": "Explains why crypto prices move quickly and how to interpret volatility.",
  "cryptopedia": "An all‑in‑one glossary of core crypto concepts and terminology.",
  "glossary": "A reference list of essential trading terms you’ll see across the platform.",
  "fiat-fees": "Explains costs related to card/bank deposits and withdrawals on typical exchanges.",
  "crypto-fees": "Explains blockchain network fees and withdrawal costs for crypto assets.",
  "tiered-discounts": "How trading volume can lower fees and why this matters for active traders.",
  "awards": "Highlights the project’s positioning as a polished student platform.",
  "legal": "Clear disclaimer about educational use, risk, and non‑custodial status.",
  "support-desk": "Help center guidance for common actions and troubleshooting.",
  "faq": "Frequently asked questions about the platform and its demo nature.",
};

const PAGES = {
  "spot": {
    title: "Spot Trading",
    group: "products",
    video: "https://www.youtube.com/embed/wcnDNyOUo6U",
    sections: [
      {
        h: "What is spot?",
        p: "Spot trading means buying and selling crypto at the current market price. You own the underlying asset (e.g., BTC) when you buy it.",
      },
      {
        h: "How it works on CryptoTrade",
        p: "Use Demo mode to practice with virtual funds, or use Real Mode after funding your balance via the Deposit page. Trades execute at live market prices.",
      },
    ],
  },
  "futures": {
    title: "Futures",
    group: "products",
    video: "https://www.youtube.com/embed/HPx-XLYzucM",
    sections: [
      { h: "Futures overview", p: "Futures are contracts that allow you to speculate on price direction with leverage. They are high-risk and require strict risk management." },
      { h: "Risk controls", p: "Professional platforms include liquidation logic, margin requirements, and insurance mechanisms. For this project, the Futures page explains the concept and shows typical controls." },
    ],
  },
  "referral-program": {
    title: "Referral Program",
    group: "products",
    video: "https://www.youtube.com/embed/dYY5YGfT6Wg",
    sections: [
      { h: "Invite & earn", p: "Share your referral link. When friends join and trade, you earn fee discounts and rewards." },
      { h: "Transparent rewards", p: "Your dashboard tracks referrals, completed verifications, and earned discounts." },
    ],
  },
  "buy-bitcoin": {
    title: "Buy Bitcoin",
    group: "products",
    video: "https://www.youtube.com/embed/wokfASjchHg",
    sections: [
      { h: "Quick steps", p: "1) Create an account  2) Deposit funds  3) Go to Trade  4) Select BTC and place a buy order." },
      { h: "Security", p: "Always enable strong passwords and keep your devices updated. Real exchanges also support 2FA and withdrawal whitelists." },
    ],
  },
  "buy-ethereum": {
    title: "Buy Ethereum",
    group: "products",
    video: "https://www.youtube.com/embed/JTAa1tpl9a8",
    sections: [
      { h: "Quick steps", p: "1) Register  2) Deposit  3) Open Trade  4) Choose ETH and buy at the current price." },
      { h: "Network awareness", p: "When withdrawing ETH from real platforms, always double-check the network (Ethereum, Arbitrum, etc.) to avoid loss." },
    ],
  },

  // Education
  "trading-tips": {
    title: "Trading Tips",
    group: "education",
    video: "https://www.youtube.com/embed/luCuTX2KH34",
    sections: [
      { h: "Start small", p: "Use Demo mode first. Focus on position sizing, entries, and exits before increasing risk." },
      { h: "Control risk", p: "Set a max loss per trade, avoid over-leverage, and don’t chase pumps. Consistency beats hype." },
      { h: "Keep a journal", p: "Track why you entered, what happened, and what you learned. This improves decision-making over time." },
    ],
  },
  "trading-tutorials": {
    title: "Trading Tutorials",
    group: "education",
    video: "https://www.youtube.com/embed/tc0sJ6Zhml8",
    sections: [
      { h: "Order types", p: "Market orders fill instantly. Limit orders target a specific price. Stop orders help manage downside risk." },
      { h: "Reading the market", p: "Learn market cap, volume, 24h change, and how news impacts volatility." },
    ],
  },
  "what-is-cryptocurrency": {
    title: "What is Cryptocurrency?",
    group: "education",
    video: "https://www.youtube.com/embed/LQF7Hg4Xe0k",
    sections: [
      { h: "Simple definition", p: "Cryptocurrency is a digital asset secured by cryptography. Many run on blockchains—distributed ledgers maintained by a network." },
      { h: "Why it matters", p: "Crypto enables programmable money, global transfers, and decentralized applications. It also brings volatility and risk." },
    ],
  },
  "how-to-invest": {
    title: "How to Invest in Crypto",
    group: "education",
    video: "https://www.youtube.com/embed/zJBef4i57zU",
    sections: [
      { h: "Build a plan", p: "Decide your time horizon, risk tolerance, and allocation. Diversify and avoid investing money you can’t afford to lose." },
      { h: "Use secure storage", p: "Real investors often move long-term holdings to self-custody wallets. Always back up recovery phrases safely." },
    ],
  },
  "crypto-changes": {
    title: "Crypto Changes",
    group: "education",
    video: "https://www.youtube.com/embed/xuFTaWfw4Oo",
    sections: [
      { h: "Market moves", p: "Prices can change quickly based on macro trends, regulation, product launches, and market sentiment." },
      { h: "Stay informed", p: "Follow reputable sources, monitor risk, and avoid reacting emotionally to every price movement." },
    ],
  },
  "cryptopedia": {
    title: "Cryptopedia",
    group: "education",
    video: "https://www.youtube.com/embed/LQF7Hg4Xe0k",
    sections: [
      { h: "Core concepts", p: "Blockchain, wallets, exchanges, stablecoins, DeFi, NFTs, and L2 scaling—explained in simple language." },
      { h: "Learn by doing", p: "Use Demo to practice and see how a portfolio reacts to market changes." },
    ],
  },
  "glossary": {
    title: "Glossary",
    group: "education",
    video: "https://www.youtube.com/embed/OsMKsKdUCa0",
    sections: [
      { h: "Common terms", p: "Market cap, volume, spread, liquidity, slippage, limit order, market order, stop-loss, leverage, liquidation…" },
      { h: "Tip", p: "If a term is unfamiliar, check this page before placing a trade in Demo or Real mode." },
    ],
  },

  // Fees
  "fiat-fees": {
    title: "Fiat Deposit & Withdrawal Fees",
    group: "fees",
    video: "https://www.youtube.com/embed/c1NItwMjjAs",
    sections: [
      { h: "Deposits", p: "Card deposits are typically instant. Some providers may charge processing fees depending on region and currency." },
      { h: "Withdrawals", p: "Withdrawals can require verification and processing time. Real exchanges show expected timelines and fee breakdowns." },
    ],
  },
  "crypto-fees": {
    title: "Crypto Deposit & Withdrawal Fees",
    group: "fees",
    video: "https://www.youtube.com/embed/c1NItwMjjAs",
    sections: [
      { h: "Network fees", p: "On real platforms, withdrawals include network fees paid to miners/validators. Fees vary by network congestion." },
      { h: "Best practice", p: "Always verify the address and network. Using the wrong network can lead to permanent loss." },
    ],
  },
  "tiered-discounts": {
    title: "Tiered Discounts of Trading Fees",
    group: "fees",
    video: "https://www.youtube.com/embed/c1NItwMjjAs",
    sections: [
      { h: "How tiers work", p: "Higher monthly trading volume typically unlocks lower fees. Some exchanges also offer discounts for holding a utility token." },
      { h: "Why it matters", p: "Fees compound over time. Even small discounts can improve performance for active traders." },
    ],
  },

  // Company
  "awards": {
    title: "Our Awards",
    group: "company",
    video: "https://www.youtube.com/embed/tc0sJ6Zhml8",
    sections: [
      { h: "Student showcase", p: "This project is presented as a professional student product—designed with a modern UI, clear information architecture, and robust APIs." },
      { h: "Quality focus", p: "Emphasis on reliability, security principles, and user experience across devices." },
    ],
  },
  "legal": {
    title: "Legal Information",
    group: "company",
    video: "https://www.youtube.com/embed/LQF7Hg4Xe0k",
    sections: [
      { h: "Educational platform", p: "CryptoTrade is an educational demo platform. It does not provide financial advice and does not process real deposits on a bank or blockchain." },
      { h: "Risk warning", p: "Cryptocurrency is volatile. In real markets you can lose money. Always do your own research." },
    ],
  },

  // Support
  "support-desk": {
    title: "Support Desk",
    group: "faq",
    video: "https://www.youtube.com/embed/tc0sJ6Zhml8",
    sections: [
      { h: "We’re here to help", p: "Get help with account access, trading basics, and troubleshooting. For urgent issues, use the Contact page." },
      { h: "Common checks", p: "If prices do not load, refresh the Markets page. If trades fail, verify your balance (Demo vs Real)." },
    ],
  },
  "faq": {
    title: "FAQ",
    group: "faq",
    video: "https://www.youtube.com/embed/LQF7Hg4Xe0k",
    sections: [
      { h: "Is this real trading?", p: "Demo mode uses virtual funds. Real mode demonstrates an exchange-style deposit flow, but remains a safe simulation for academic purposes." },
      { h: "Where do prices come from?", p: "Prices are pulled from CoinGecko through the backend and refreshed periodically." },
      { h: "Why can’t I trade?", p: "In Real mode, you must deposit first. In Demo mode, check that qty is valid and the selected asset is available." },
    ],
  },
};

export default function InfoPage() {
  const { slug } = useParams();
  const page = PAGES[slug];

  if (!page) {
    return (
      <div className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 22 }}>Page not found</div>
          <div className="p" style={{ marginTop: 8 }}>This page does not exist yet.</div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" to="/">Back to Home</Link>
            <Link className="btn btn-ghost" to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    );
  }

  const group = GROUP_CONTENT[page.group] || GROUP_CONTENT.products;
  const summary = SUMMARIES[slug] || group.summary;
  const details = page.details || group.details;
  const visuals = page.visuals || group.visuals;
  const faqs = page.faqs || group.faqs;

  return (
    <div>
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <h1 style={{ margin: "0 0 10px" }}>{page.title}</h1>
            <div className="p">
              {summary}
            </div>
            <div className="p" style={{ marginTop: 10 }}>
              {group.summary}
            </div>
            <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}>
              <Link className="btn btn-ghost" to="/markets">Markets</Link>
              <Link className="btn btn-ghost" to="/trade">Demo</Link>
              <Link className="btn btn-primary" to="/trade-real">Trade</Link>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: 14 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)" }}>
                <iframe
                  width="100%"
                  height="320"
                  src={page.video}
                  title={`${page.title} video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid3">
          {visuals.map((v) => (
            <div key={v.label} className="card" style={{ padding: 16 }}>
              <div className="small" style={{ fontWeight: 900 }}>{v.label}</div>
              <div style={{ fontWeight: 1000, fontSize: 20, marginTop: 8 }}>{v.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid2">
          {details.map((d, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 16 }}>Detailed explanation</div>
              <div className="p" style={{ marginTop: 8 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid3">
          {page.sections.map((s) => (
            <div key={s.h} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 1000, fontSize: 16 }}>{s.h}</div>
              <div className="p" style={{ marginTop: 8 }}>{s.p}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Quick FAQs</div>
          <div style={{ marginTop: 10 }}>
            {faqs.map((f, i) => (
              <details key={i} style={{ marginBottom: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 900 }}>{f.q}</summary>
                <div className="p" style={{ marginTop: 6 }}>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
