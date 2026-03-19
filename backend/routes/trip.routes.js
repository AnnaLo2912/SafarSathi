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

// Public or optional auth
router.post("/generate", optionalAuth, generateTrip);
router.post("/packing-list", getPackingList);
router.get("/my", protect, getMyTrips);
router.get("/:id", getTrip);
router.put("/:id/save", protect, saveTrip);
router.delete("/:id", protect, deleteTrip);

export default router;