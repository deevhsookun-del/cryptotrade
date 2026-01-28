require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { getMarketsCached } = require("./services/marketService");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    socket.join(`user:${payload.id}`);
  } catch {
    // allow unauthenticated for public streams
  }
  return next();
});

io.on("connection", (socket) => {
  socket.emit("connected", { ok: true });
});

app.set("io", io);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/markets", require("./routes/markets.routes"));
app.use("/api/trades", require("./routes/trades.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));

setInterval(async () => {
  try {
    const markets = await getMarketsCached({ perPage: 120, page: 1 });
    io.emit("markets", markets);
  } catch (err) {
    // ignore background errors
  }
}, 5000);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "cryptotrade-api", ts: Date.now() });
});
