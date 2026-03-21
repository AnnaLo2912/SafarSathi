import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.middleware.js";
import {
  getVerificationStatus,
  uploadVerificationCertificate,
} from "../controllers/verification.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and PDF files are allowed"));
    }
    return cb(null, true);
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification uploads. Please try again shortly.",
  },
});

router.get("/status", protect, getVerificationStatus);
router.post("/upload", protect, uploadLimiter, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid upload request",
      });
    }
    return next();
  });
}, uploadVerificationCertificate);

export default router;
