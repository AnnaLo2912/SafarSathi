import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import tripRoutes from "./routes/trip.routes.js";

dotenv.config();
connectDB();

const app = express();

// ── Middleware FIRST ──────────────────────
app.use(cors());
app.use(express.json());                        // parses JSON body
app.use(express.urlencoded({ extended: true })); // parses form data

// ── Health check ──────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SafarSathi API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/trips", tripRoutes);
app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({ body: req.body });
});

// ── 404 ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/auth.routes.js";
// import tripRoutes from "./routes/trip.routes.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// // import connectDB from "./config/db.js";

// dotenv.config();

// const app = express();

// // middleware
// app.use(cors());
// app.use(express.json());

// // test route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // port
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // connectDB();