import { useEffect, useState } from "react";

export default function StatusPill() {
  const [state, setState] = useState({ ok: false, loading: true });

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/health");
        if (!res.ok) throw new Error("Bad response");
        await res.json();
        setState({ ok: true, loading: false });
      } catch {
        setState({ ok: false, loading: false });
      }
    };
    run();
  }, []);

  const label = state.loading ? "Checking backend…" : state.ok ? "Backend online" : "Backend offline";
  const dotClass = state.loading ? "dot warn" : state.ok ? "dot good" : "dot bad";

  return (
    <span className="badge" title="API server status (localhost:5000)">
      <span className={dotClass} />
      {label}
    </span>
  );
}
