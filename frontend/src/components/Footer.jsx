import { Link } from "react-router-dom";
import SocialIcons from "./SocialIcons";

function Col({ title, links }) {
  return (
    <div>
      <div className="footerTitle">{title}</div>
      {links.map((l) => (
        <Link key={l.to} className="footerLink" to={l.to}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  const products = [
    { to: "/p/spot", label: "Spot" },
    { to: "/p/futures", label: "Futures" },
    { to: "/p/referral-program", label: "Referral program" },
    { to: "/p/buy-bitcoin", label: "Buy Bitcoin" },
    { to: "/p/buy-ethereum", label: "Buy Ethereum" },
  ];

  const education = [
    { to: "/p/trading-tips", label: "Trading tips" },
    { to: "/p/trading-tutorials", label: "Trading tutorials" },
    { to: "/p/what-is-cryptocurrency", label: "What is Cryptocurrency" },
    { to: "/p/how-to-invest", label: "How to Invest in Crypto" },
    { to: "/p/crypto-changes", label: "Crypto Changes" },
    { to: "/p/cryptopedia", label: "Cryptopedia" },
    { to: "/p/glossary", label: "Glossary" },
  ];

  const fees = [
    { to: "/p/fiat-fees", label: "Fiat Deposit & Withdrawal Fees" },
    { to: "/p/crypto-fees", label: "Crypto Deposit & Withdrawal Fees" },
    { to: "/p/tiered-discounts", label: "Tiered Discounts of Trading Fees" },
  ];

  const company = [
    { to: "/about", label: "About us" },
    { to: "/p/awards", label: "Our awards" },
    { to: "/p/legal", label: "Legal Information" },
  ];

  const faq = [
    { to: "/contact", label: "Contact" },
    { to: "/p/support-desk", label: "Support desk" },
    { to: "/p/faq", label: "FAQ" },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footerGrid">
          <Col title="Products" links={products} />
          <Col title="Education" links={education} />
          <Col title="Fees" links={fees} />
          <Col title="Company" links={company} />
          <Col title="FAQ" links={faq} />
        </div>

        <div className="divider" style={{ marginTop: 14 }} />

        {/* Social icons centered (only icons, no logo/text block) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <SocialIcons />
        </div>

        <div className="small footerMeta">
          <div>© {new Date().getFullYear()} CryptoTrade. All rights reserved.</div>
          <div>Educational project • Not financial advice • No real funds are processed</div>
        </div>
      </div>
    </footer>
  );
}
