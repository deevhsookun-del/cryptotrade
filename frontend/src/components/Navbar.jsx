import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import cryptoLogo from "../assets/crypto-logo.svg";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  const linkClass = ({ isActive }) =>
    "navLink" + (isActive ? " navLinkActive" : "");

  const primaryLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/markets", label: "Markets" },
      { to: "/learn", label: "Learn" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/trade", label: "Demo" },
      { to: "/trade-real", label: "Trade" },
      { to: "/deposit", label: "Deposit" },
    ],
    []
  );

  const authLinks = useMemo(
    () => [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ],
    []
  );

  const publicLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/markets", label: "Markets" },
      { to: "/learn", label: "Learn" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
    []
  );

  return (
    <header className="nav">
      <div className="navInner navInnerFull">
        <Link to="/" className="brand" aria-label="CryptoTrade Home">
          <img src={cryptoLogo} className="logoImg" alt="CryptoTrade logo" />
          <div className="brandText">
            <div className="brandName">CryptoTrade</div>
            <div className="brandTag">trade safely</div>
          </div>
        </Link>

        <nav className="navLinks" aria-label="Primary">
          <div className="navCenter">
            {(user ? primaryLinks : publicLinks).map((l) => (
              <NavLink key={l.to} className={linkClass} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="navRight">
            {/* ✅ AUTH AREA */}
            {user ? (
              <>
                <button className="btn btn-ghost" type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              authLinks.map((l) => (
                <NavLink key={l.to} className={linkClass} to={l.to}>
                  {l.label}
                </NavLink>
              ))
            )}

            <button
              className="btn btn-ghost"
              onClick={toggle}
              type="button"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </nav>

        <button
          className="burger"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <>
          <div className="drawerBackdrop" onClick={() => setOpen(false)} />
          <div className="drawer">
            <div className="card">
              <div className="drawerInner">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 1000 }}>Menu</div>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    ✖
                  </button>
                </div>

          <div className="drawerGrid">
            {(user ? primaryLinks : publicLinks).map((l) => (
              <NavLink key={l.to} className={linkClass} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="divider" style={{ marginTop: 12 }} />

          <div className="row" style={{ marginTop: 12 }}>
            {user ? (
              <>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={logout}
                        style={{ marginLeft: "auto" }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    authLinks.map((l) => (
                      <NavLink key={l.to} className={linkClass} to={l.to}>
                        {l.label}
                      </NavLink>
                    ))
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={toggle}
                    type="button"
                    style={{ marginLeft: "auto" }}
                  >
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
