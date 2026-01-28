import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await requestPasswordReset(email.trim());
      setInfo(res?.message || "Check your inbox for the reset link.");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authGrid">
        <div className="card" style={{ padding: 18 }}>
          <div className="pill">✉️ Email reset • Secure access</div>
          <h1 className="h1" style={{ marginTop: 12 }}>Forgot your password?</h1>
          <p className="p" style={{ marginTop: 10 }}>
            Enter your email and we’ll send a password reset link.
          </p>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Reset link</div>

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

            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
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
