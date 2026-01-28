import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();

  const emailFromLink = useMemo(() => params.get("email") || "", [params]);
  const tokenFromLink = useMemo(() => params.get("token") || "", [params]);

  const [email, setEmail] = useState(emailFromLink);
  const [token, setToken] = useState(tokenFromLink);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !token || !password) {
      setError("Email, token, and new password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(email.trim(), token.trim(), password);
      setInfo(res?.message || "Password reset successful. You can log in now.");
      setPassword("");
      setConfirm("");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authGrid">
        <div className="card" style={{ padding: 18 }}>
          <div className="pill">🔁 Reset access • Secure link</div>
          <h1 className="h1" style={{ marginTop: 12 }}>Set a new password</h1>
          <p className="p" style={{ marginTop: 10 }}>
            Use the token from your email to set a new password.
          </p>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>New password</div>

          {error && <div className="p" style={{ marginTop: 12 }}>❌ {error}</div>}
          {info && <div className="p" style={{ marginTop: 12 }}>✅ {info}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Email</div>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <div className="label">Reset token</div>
              <input
                className="input"
                type="text"
                placeholder="Paste token from email"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="field">
              <div className="label">New password</div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="field">
              <div className="label">Confirm password</div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
              <Link className="btn btn-ghost" to="/login">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
