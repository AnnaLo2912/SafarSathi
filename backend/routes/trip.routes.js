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

// 🔥 Async wrapper to catch errors properly
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Routes ─────────────────────────────────────────

// Generate AI trip (optional login)
router.post("/generate", optionalAuth, asyncHandler(generateTrip));

// Generate packing list
router.post("/packing-list", asyncHandler(getPackingList));

// Get logged-in user's trips
router.get("/my", protect, asyncHandler(getMyTrips));

// Get single trip by ID
router.get("/:id", asyncHandler(getTrip));

// Save a trip
router.put("/:id/save", protect, asyncHandler(saveTrip));

// Delete a trip
router.delete("/:id", protect, asyncHandler(deleteTrip));

export default router;