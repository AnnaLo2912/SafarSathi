import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getProfile, addContact, deleteContact,
  updateProfile, triggerSOS, resolveAlert,
} from "../controllers/safety.controller.js";

const router = express.Router();

router.get("/profile",                  protect, getProfile);
router.patch("/profile",                protect, updateProfile);
router.post("/contacts",                protect, addContact);
router.delete("/contacts/:contactId",   protect, deleteContact);
router.post("/sos",                     protect, triggerSOS);
router.patch("/sos/:alertId/resolve",   protect, resolveAlert);

export default router;