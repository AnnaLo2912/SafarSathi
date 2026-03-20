import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.patch("/:id", protect, updateBookingStatus);

export default router;
