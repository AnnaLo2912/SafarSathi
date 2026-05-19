import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import tripRoutes from "./routes/trip.routes.js";
import guideRoutes from "./routes/guide.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import blogRoutes         from "./routes/blog.routes.js";
import safetyRoutes       from "./routes/safety.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

connectDB();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins  = [
      "http://localhost:3000",
      "https://safar-sathi-ecru.vercel.app"
    ];
    const isLocalhostPort = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhostPort) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SafarSathi API is running 🚀", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/trips", tripRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/blogs",        blogRoutes);
app.use("/api/safety",       safetyRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));