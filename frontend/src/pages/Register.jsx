import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IMAGES } from "../assets/images";

export default function Register() {
  const nav = useNavigate();
  const { register, login } = useAuth();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !address || !country || !phone) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // 1) register user
      await register(name.trim(), email.trim(), password);

      // 2) pro UX: auto-login after register
      const res = await login(email.trim(), password);

      if (res?.requiresOtp) {
        nav("/login", { state: { email: email.trim(), otpRequired: true } });
        return;
      }

      // 3) go to dashboard
      nav("/dashboard");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authGrid">
        <div
          className="card registerHero"
          style={{
            padding: 18,
            backgroundImage:
              `linear-gradient(180deg, rgba(8,10,20,0.78), rgba(8,10,20,0.45)), url('${IMAGES.registerHero}')`,
          }}
        >
          <div className="pill">🧾 Create account • Demo Trading</div>
          <h1 className="h1" style={{ marginTop: 12 }}>Create your account</h1>
          <p className="p" style={{ marginTop: 10 }}>
            Register to access demo portfolio and simulated buy/sell.
          </p>

          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn btn-ghost" to="/learn">Learn first</Link>
            <Link className="btn btn-ghost" to="/markets">Browse markets</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Sign up</div>

          {error && <div className="p" style={{ marginTop: 12 }}>❌ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="grid2" style={{ marginTop: 6 }}>
              <div className="field">
                <div className="label">Full name</div>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <div className="label">Phone number</div>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="field">
              <div className="label">Address</div>
              <input
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, ZIP"
                autoComplete="street-address"
              />
            </div>

            <div className="field">
              <div className="label">Country</div>
              <input
                className="input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                autoComplete="country-name"
              />
            </div>

            <div className="field">
              <div className="label">Email</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <div className="label">Referral code (optional)</div>
              <input
                className="input"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>
              <Link className="btn btn-ghost" to="/login">
                I already have an account
              </Link>
            </div>
          </form>

          <div className="divider" style={{ marginTop: 14 }} />
          <div className="small" style={{ marginTop: 12 }}>
            By signing up you agree this is a demo environment.
          </div>
        </div>
      </div>
    </div>
  );
}
