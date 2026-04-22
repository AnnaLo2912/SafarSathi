import express from "express";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import {
  generateTrip, saveCustomTrip, editTrip,
  getTrip, getMyTrips, saveTrip, deleteTrip, getPackingList,
} from "../controllers/trip.controller.js";

const router = express.Router();

router.post("/generate",       optionalAuth, generateTrip);
router.post("/custom",         protect,      saveCustomTrip);
router.get("/my",              protect,      getMyTrips);
router.get("/:id",                           getTrip);
router.put("/:id/save",        protect,      saveTrip);
router.put("/:id/edit",        protect,      editTrip);
router.delete("/:id",          protect,      deleteTrip);
router.post("/packing-list",                 getPackingList);

export default router;