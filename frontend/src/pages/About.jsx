import { IMAGES } from "../assets/images";
import sookunImg from "../assets/sookun-deevesh.jpg";
import rayanshuImg from "../assets/rayanshu-pahladi.jpg";
import ilhaanImg from "../assets/ilhaan-mohubuth.jpg";

const aboutImg = IMAGES.aboutHero;

function InfoCard({ title, text }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div className="p" style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
}

export default function About() {
  return (
    <div>
      <section className="section">
        <div className="grid2">
          <div className="card" style={{ padding: 18 }}>
            <h1 style={{ margin: "0 0 10px" }}>About CryptoTrade</h1>
            <p className="p">
              CryptoTrade is a modern demo cryptocurrency trading platform built for learning.
              It helps beginners understand markets, portfolios, and trading logic in a safe environment.
              No real funds are used.
            </p>

            <div className="p" style={{ marginTop: 12 }}>
              <strong>Our mission:</strong> Make crypto education simple, visual, and interactive.
            </div>

            <div className="p" style={{ marginTop: 12 }}>
              <strong>Our slogan:</strong> “crypto made simple”
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <img
              src={aboutImg}
              alt="About CryptoTrade"
              style={{ width: "100%", height: "100%", minHeight: 320, objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid3">
          <InfoCard
            title="Demo-first"
            text="Every new user can start with a demo balance and practice trading without risk."
          />
          <InfoCard
            title="Clean & professional UI"
            text="A simple interface that feels like a real exchange but stays beginner-friendly."
          />
          <InfoCard
            title="Learning built-in"
            text="Dedicated Learn page with clear explanations and YouTube learning resources."
          />
        </div>
      </section>

      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 1000, fontSize: 20 }}>Leadership</div>
          <div className="p" style={{ marginTop: 8 }}>
            CryptoTrade is presented as a student-built exchange-style platform. Below is the leadership team showcased on the website.
          </div>

          <div className="grid3" style={{ marginTop: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <img
                src={sookunImg}
                alt="Founder: Sookun Deevesh"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  objectPosition: "center 30%",
                  borderRadius: 16,
                }}
              />
              <div style={{ fontWeight: 1000, fontSize: 18, marginTop: 10 }}>Sookun Deevesh</div>
              <div className="small">Founder</div>
              <div className="p" style={{ marginTop: 8 }}>
                Focuses on product direction, security-first design, and building a clean user experience that feels like a real exchange.
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <img
                src={ilhaanImg}
                alt="Director: Ilhaan Mohubuth"
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 16 }}
              />
              <div style={{ fontWeight: 1000, fontSize: 18, marginTop: 10 }}>Ilhaan Mohubuth</div>
              <div className="small">Director</div>
              <div className="p" style={{ marginTop: 8 }}>
                Oversees operations and compliance. Ensures the platform follows clear policies, transparent fees, and strong risk controls.
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <img
                src={rayanshuImg}
                alt="Manager: Rayanshu Pahladi"
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 16 }}
              />
              <div style={{ fontWeight: 1000, fontSize: 18, marginTop: 10 }}>Rayanshu Pahladi</div>
              <div className="small">Manager</div>
              <div className="p" style={{ marginTop: 8 }}>
                Manages customer support workflows, education content, and platform quality checks to keep every page consistent and professional.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Disclaimer</div>
          <p className="p" style={{ marginTop: 8 }}>
            CryptoTrade is a demo platform for education only. It does not provide financial advice,
            and it does not execute real trades on a blockchain. Cryptocurrency markets are highly volatile — always do your research.
          </p>
        </div>
      </section>
    </div>
  );
}
