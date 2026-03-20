import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getGuides, toggleAvailability } from "../controllers/guide.controller.js";

const router = express.Router();

router.post("/availability", protect, toggleAvailability);
router.get("/", getGuides);

export default router;
