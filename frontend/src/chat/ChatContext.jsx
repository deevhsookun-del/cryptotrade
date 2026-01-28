import { createContext, useContext, useMemo, useState } from "react";

const ChatCtx = createContext(null);

export function ChatProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi 👋 I’m CryptoTrade Assistant. Ask me anything about the platform (demo mode, markets, trading, safety).",
    },
  ]);

  const value = useMemo(
    () => ({ open, setOpen, messages, setMessages }),
    [open, messages]
  );

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function useChat() {
  const v = useContext(ChatCtx);
  if (!v) throw new Error("useChat must be used inside ChatProvider");
  return v;
}
