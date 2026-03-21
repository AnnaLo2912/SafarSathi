import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { deactivateGuideAccount, deleteGuideAccount, getGuides, reactivateGuideAccount, toggleAvailability } from "../controllers/guide.controller.js";

const router = express.Router();

router.post("/availability", protect, toggleAvailability);
router.patch("/availability", protect, toggleAvailability);
router.patch("/deactivate", protect, deactivateGuideAccount);
router.patch("/reactivate", protect, reactivateGuideAccount);
router.delete("/account", protect, deleteGuideAccount);
router.get("/", getGuides);

export default router;
