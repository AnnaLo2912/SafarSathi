import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import tripRoutes from "./routes/trip.routes.js";
import guideRoutes from "./routes/guide.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import verificationRoutes from "./routes/verification.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
    ];

    const isLocalhostPort = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhostPort) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SafarSathi API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/trips", tripRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/verification", verificationRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




// import 'dotenv/config';
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/auth.routes.js";
// import tripRoutes from "./routes/trip.routes.js";

// // dotenv.config();
// connectDB();

// const app = express();

// // ── Middleware FIRST ──────────────────────
// app.use(cors());
// app.use(express.json());                        // parses JSON body
// app.use(express.urlencoded({ extended: true })); // parses form data

// // ── Health check ──────────────────────────
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "SafarSathi API is running 🚀",
//     timestamp: new Date().toISOString(),
//   });
// });

// // ── Routes ────────────────────────────────
// app.use("/api/auth",  authRoutes);
// app.use("/api/trips", tripRoutes);
// app.post("/test", (req, res) => {
//   console.log(req.body);
//   res.json({ body: req.body });
// });

// // ── 404 ───────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import connectDB from "./config/db.js";
// // import authRoutes from "./routes/auth.routes.js";
// // import tripRoutes from "./routes/trip.routes.js";

// // dotenv.config();
// // connectDB();

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // app.get("/", (req, res) => {
// //   res.send("API is running...");
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // // import connectDB from "./config/db.js";

// // dotenv.config();

// // const app = express();

// // // middleware
// // app.use(cors());
// // app.use(express.json());

// // // test route
// // app.get("/", (req, res) => {
// //   res.send("API is running...");
// // });

// // // port
// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });

// // // connectDB();