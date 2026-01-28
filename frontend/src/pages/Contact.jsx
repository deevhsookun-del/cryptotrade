import SocialIcons from "../components/SocialIcons";

export default function Contact() {
  return (
    <div>
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <h1 style={{ margin: "0 0 10px" }}>Contact CryptoTrade</h1>
            <p className="p">
              Need help or have feedback? Send us a message below. You can also reach us via our social pages.
            </p>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Social pages</div>
              <SocialIcons />
            </div>

            <div className="p" style={{ marginTop: 14, fontSize: 13 }}>
              Support email (demo): <strong>support@cryptotrade.demo</strong>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Send a message</div>

            <div className="field">
              <div className="label">Your name</div>
              <input className="input" placeholder="Your full name" />
            </div>

            <div className="field">
              <div className="label">Email</div>
              <input className="input" type="email" placeholder="you@example.com" />
            </div>

            <div className="field">
              <div className="label">Message</div>
              <textarea
                className="input"
                rows="5"
                placeholder="Tell us what you need help with…"
                style={{ resize: "vertical" }}
              />
            </div>

            <button className="btn btn-primary" type="button">
              Submit (demo)
            </button>

            <div className="small" style={{ marginTop: 10 }}>
              This form is UI-only for now. Later we’ll connect it to the backend.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
