import express from "express";
import {
  generateTrip,
  getTrip,
  getMyTrips,
  saveTrip,
  deleteTrip,
  getPackingList,
} from "../controllers/trip.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// ── SPECIFIC routes first (before /:id) ──────────────────────
router.post("/generate",      optionalAuth, generateTrip);
router.post("/packing-list",               getPackingList);
router.get("/my",             protect,      getMyTrips);   // ← MUST be before /:id

// ── DYNAMIC routes last ───────────────────────────────────────
router.get("/:id",                          getTrip);
router.put("/:id/save",       protect,      saveTrip);
router.delete("/:id",         protect,      deleteTrip);

export default router;






