import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createReview,
  getGuideReviews,
  getReviewForBooking,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/", protect, getGuideReviews);
router.get("/:booking_id", protect, getReviewForBooking);

export default router;
