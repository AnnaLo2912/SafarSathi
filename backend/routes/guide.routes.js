import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { deleteGuideAccount, getGuides, toggleAvailability } from "../controllers/guide.controller.js";

const router = express.Router();

router.post("/availability", protect, toggleAvailability);
router.patch("/availability", protect, toggleAvailability);
router.delete("/account", protect, deleteGuideAccount);
router.get("/", getGuides);

export default router;
