import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [info, setInfo] = useState("");
  const [resendWait, setResendWait] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setInterval(() => {
      setResendWait((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendWait]);

  useEffect(() => {
    if (loc.state?.email) {
      setEmail(loc.state.email);
    }
    if (loc.state?.otpRequired) {
      setStep("otp");
      setInfo("We sent a 6-digit code to your email.");
      setResendWait(60);
    }
  }, [loc.state]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (step === "credentials") {
      if (!email || !password) {
        setError("Please enter email and password.");
        return;
      }
    } else {
      if (!otp) {
        setError("Please enter the 6-digit code.");
        return;
      }
    }

    try {
      setLoading(true);
      if (step === "credentials") {
        const res = await login(email.trim(), password);
        if (res?.requiresOtp) {
          setStep("otp");
          setInfo("We sent a 6-digit code to your email.");
          setResendWait(60);
          return;
        }
        nav("/dashboard");
      } else {
        await verifyOtp(email.trim(), otp.trim());
        nav("/dashboard");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authGrid">
        <div className="card" style={{ padding: 18 }}>
          <div className="pill">🔒 Secure UI • Demo Trading</div>
          <h1 className="h1" style={{ marginTop: 12 }}>Welcome back</h1>
          <p className="p" style={{ marginTop: 10 }}>
            Login to access your dashboard and place simulated buy/sell orders.
          </p>

          <div className="card" style={{ marginTop: 14, padding: 14, boxShadow: "none" }}>
            <div style={{ fontWeight: 1000 }}>What you get</div>
            <ul className="small" style={{ marginTop: 10, lineHeight: 1.75 }}>
              <li>Demo balance to practice safely</li>
              <li>Market prices from public APIs</li>
              <li>Portfolio overview + history</li>
              <li>Dark/Light mode + responsive layout</li>
            </ul>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn btn-ghost" to="/learn">Learn first</Link>
            <Link className="btn btn-ghost" to="/markets">Browse markets</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Sign in</div>

          {error && <div className="p" style={{ marginTop: 12 }}>❌ {error}</div>}
          {info && <div className="p" style={{ marginTop: 12 }}>✅ {info}</div>}

          <form onSubmit={onSubmit}>
            {step === "credentials" ? (
              <>
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
                  <div className="label">Password</div>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <div className="label">Email</div>
                  <input className="input" type="email" value={email} disabled />
                </div>
                <div className="field">
                  <div className="label">One-time code</div>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="small" style={{ marginTop: 8 }}>
                  Code expires in 10 minutes.
                </div>
              </>
            )}

            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                  ? step === "credentials"
                    ? "Sending code..."
                    : "Verifying..."
                  : step === "credentials"
                    ? "Continue"
                    : "Verify & Login"}
              </button>
              {step === "credentials" ? (
                <Link className="btn btn-ghost" to="/register">
                  Create account
                </Link>
              ) : (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>
          </form>

          <div className="divider" style={{ marginTop: 14 }} />
          <div className="small" style={{ marginTop: 12 }}>
            {step === "credentials" ? (
              <>
                Forgot password?{" "}
                <Link to="/forgot-password" style={{ fontWeight: 900 }}>
                  Reset it
                </Link>
              </>
            ) : (
              <>
                Didn’t get a code?{" "}
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px" }}
                  onClick={async () => {
                    setError("");
                    setInfo("");
                    try {
                      if (!password) {
                        setError("Enter your password to resend a code.");
                        return;
                      }
                      if (resendWait > 0) {
                        return;
                      }
                      setLoading(true);
                      await login(email.trim(), password);
                      setInfo("A new code was sent.");
                      setResendWait(60);
                    } catch (e) {
                      setError(
                        e?.response?.data?.message || e?.message || "Could not resend code"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || resendWait > 0}
                >
                  {resendWait > 0 ? `Resend in ${resendWait}s` : "Resend code"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
