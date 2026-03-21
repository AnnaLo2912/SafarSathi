import Trip from "../models/Trip.model.js";
import { generateItinerary, generatePackingList } from "../services/gemini.service.js";

// ── Generate AI Trip ──────────────────────────────────────────
// POST /api/trips/generate
export const generateTrip = async (req, res) => {
  try {
    const {
      destination, duration, budget,
      travelers, tripStyle, startDate,
    } = req.body;

    if (!destination || !duration || !budget) {
      return res.status(400).json({
        success: false,
        message: "Destination, duration and budget are required",
      });
    }

    // Validate startDate if provided
    let parsedStartDate = undefined;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date format",
        });
      }
    }

    console.log(`🤖 Generating itinerary for ${destination}${parsedStartDate ? ` from ${parsedStartDate.toDateString()}` : ''}...`);

    const aiData = await generateItinerary({
      destination,
      duration:   parseInt(duration),
      budget:     parseFloat(budget),
      travelers:  parseInt(travelers) || 1,
      tripStyle:  tripStyle || "budget",
      startDate:  parsedStartDate,
    });

    const tripData = {
      destination,
      duration:   parseInt(duration),
      budget:     parseFloat(budget),
      travelers:  parseInt(travelers) || 1,
      tripStyle:  tripStyle || "budget",
      startDate:  parsedStartDate,
      ...aiData,
    };

    if (req.user) {
      tripData.firebaseUid = req.user.uid;
      tripData.userEmail   = req.user.email;
    }

    const trip = await Trip.create(tripData);

    res.status(201).json({
      success: true,
      message: `✈️ ${duration}-night itinerary for ${destination} generated!`,
      trip,
    });

  } catch (err) {
    console.error("❌ Trip generation error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate itinerary. Please try again.",
      error: err.message,
    });
  }
};

// ── Get Single Trip ───────────────────────────────────────────
// GET /api/trips/:id
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Trips ──────────────────────────────────────────────
// GET /api/trips/my  (protected)
export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ firebaseUid: req.user.uid })
      .sort({ createdAt: -1 })
      .select(
        "destination duration budget tripStyle status startDate createdAt summary highlights lat lon"
      );
    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Save Trip ─────────────────────────────────────────────────
// PUT /api/trips/:id/save  (protected)
export const saveTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "saved" },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
    res.json({ success: true, message: "Trip saved! ✅", trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Trip ───────────────────────────────────────────────
// DELETE /api/trips/:id  (protected — only owner can delete)
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id:         req.params.id,
      firebaseUid: req.user.uid,
    });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
    res.json({ success: true, message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Packing List ──────────────────────────────────────────────
// POST /api/trips/packing-list
export const getPackingList = async (req, res) => {
  try {
    const { destination, duration, season } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: "Destination is required" });
    }
    const packingList = await generatePackingList({ destination, duration, season });
    res.json({ success: true, packingList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};