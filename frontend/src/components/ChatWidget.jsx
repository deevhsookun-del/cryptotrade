import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../chat/ChatContext";

function getBotReply(userText) {
  const t = userText.toLowerCase();

  if (t.includes("demo")) {
    return {
      text:
        "Demo mode lets you explore the platform using virtual funds. It’s the same website experience — just simulated balances and trades. You can practice before using real trading (future).",
      quick: [
        { label: "Go to Dashboard", to: "/dashboard" },
        { label: "Learn crypto", to: "/learn" },
      ],
    };
  }

  if (t.includes("market") || t.includes("price")) {
    return {
      text:
        "The Markets page shows live prices pulled from a public API (CoinGecko). You can refresh it and later we’ll add charts + real-time updates.",
      quick: [{ label: "Open Markets", to: "/markets" }],
    };
  }

  if (t.includes("trade") || t.includes("buy") || t.includes("sell")) {
    return {
      text:
        "Trading is currently simulated (paper trading). Next we connect Trades to your portfolio, store history in the database, and add validations.",
      quick: [{ label: "Open Demo", to: "/trade" }],
    };
  }

  if (t.includes("register") || t.includes("sign up")) {
    return {
      text:
        "To get started, create an account. You’ll get a demo balance to explore the platform safely.",
      quick: [{ label: "Register", to: "/register" }],
    };
  }

  if (t.includes("login")) {
    return {
      text:
        "Login gives access to your dashboard and simulated trading. If you just want to explore, you can use demo mode too.",
      quick: [{ label: "Login", to: "/login" }],
    };
  }

  if (t.includes("contact") || t.includes("support") || t.includes("help")) {
    return {
      text:
        "You can contact support using the Contact page. We’ll later connect the form to the backend to send messages.",
      quick: [{ label: "Contact", to: "/contact" }],
    };
  }

  if (t.includes("dark") || t.includes("light")) {
    return {
      text:
        "You can switch between Dark and Light mode using the button in the navigation bar.",
      quick: [{ label: "Home", to: "/" }],
    };
  }

  if (t.includes("safe") || t.includes("security") || t.includes("scam")) {
    return {
      text:
        "Safety basics: never share seed phrases/private keys, enable 2FA on real platforms, and beware of fake links. Start with demo trading to learn risk-free.",
      quick: [{ label: "Learn safety tips", to: "/learn" }],
    };
  }

  return {
    text:
      "I can help with: markets/prices, demo vs real mode, trading steps, security tips, and where to find features. What do you want to do?",
    quick: [
      { label: "Markets", to: "/markets" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Learn", to: "/learn" },
    ],
  };
}

function Bubble({ role, children }) {
  const isBot = role === "bot";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        margin: "8px 0",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 12px",
          borderRadius: 16,
          border: "1px solid var(--line)",
          background: isBot ? "rgba(255,255,255,.06)" : "rgba(109,92,255,.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const nav = useNavigate();
  const { open, setOpen, messages, setMessages } = useChat();
  const [text, setText] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [open, messages]);

  const quickButtons = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "bot" && m.quick);
    return last?.quick || [];
  }, [messages]);

  function send() {
    const msg = text.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setText("");

    const reply = getBotReply(msg);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: reply.text, quick: reply.quick }]);
    }, 250);
  }

  return (
    <div className="chatFab">
      {!open && (
        <button className="btn btn-primary" onClick={() => setOpen(true)} type="button">
          🤖 AI Chat
        </button>
      )}

      {open && (
        <div
          className="card"
          style={{
            width: 360,
            maxWidth: "calc(100vw - 26px)",
            height: 520,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 900 }}>AI Chatbox</div>
            <button className="btn btn-ghost" onClick={() => setOpen(false)} type="button">
              ✖
            </button>
          </div>

          <div ref={listRef} style={{ padding: 12, overflowY: "auto", flex: 1 }}>
            {messages.map((m, idx) => (
              <Bubble key={idx} role={m.role}>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </Bubble>
            ))}

            {quickButtons.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {quickButtons.map((b) => (
                  <button
                    key={b.to}
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      nav(b.to);
                      setOpen(false);
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask about markets, trading, demo mode…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button className="btn btn-primary" onClick={send} type="button">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
