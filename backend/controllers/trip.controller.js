import Trip from "../models/Trip.model.js";
import Tourist from "../models/Tourist.model.js";
import { generateItinerary, generatePackingList } from "../services/gemini.service.js";

// ── Generate AI Trip ──────────────────────────────────────────
// POST /api/trips/generate
// Optional auth — works for guests too
export const generateTrip = async (req, res) => {
  try {
    const { destination, duration, budget, travelers, tripStyle, startDate } =
      req.body;

    // Validate required fields
    if (!destination || !duration || !budget) {
      return res.status(400).json({
        success: false,
        message: "Destination, duration (nights), and budget (USD) are required",
      });
    }

    if (budget < 20) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum budget is $20 USD" });
    }

    console.log(`🤖 Generating itinerary for ${destination}...`);

    // Call Gemini AI
    const aiData = await generateItinerary({
      destination,
      duration: parseInt(duration),
      budget: parseFloat(budget),
      travelers: parseInt(travelers) || 1,
      tripStyle: tripStyle || "budget",
      startDate,
    });

    // Build trip object
    const tripData = {
      destination,
      duration: parseInt(duration),
      budget: parseFloat(budget),
      travelers: parseInt(travelers) || 1,
      tripStyle: tripStyle || "budget",
      startDate: startDate ? new Date(startDate) : undefined,
      ...aiData,
    };

    // Attach to logged-in tourist if available
    if (req.tourist) {
      tripData.tourist = req.tourist._id;
    }

    // Save to DB
    const trip = await Trip.create(tripData);

    // Add to tourist's saved trips if logged in
    if (req.tourist) {
      await Tourist.findByIdAndUpdate(req.tourist._id, {
        $push: { savedTrips: trip._id },
      });
    }

    res.status(201).json({
      success: true,
      message: `✈️ ${duration}-night itinerary for ${destination} generated!`,
      trip,
    });
  } catch (err) {
    console.error("Trip generation error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate itinerary. Please try again.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ── Get Single Trip ───────────────────────────────────────────
// GET /api/trips/:id
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      "tourist",
      "name email"
    );
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Trips ──────────────────────────────────────────────
// GET /api/trips/my
export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ tourist: req.tourist._id })
      .sort({ createdAt: -1 })
      .select(
        "destination duration budget tripStyle status startDate createdAt galleryImages summary highlights"
      );

    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Save Trip ─────────────────────────────────────────────────
// PUT /api/trips/:id/save
export const saveTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "saved" },
      { new: true }
    );
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    res.json({ success: true, message: "Trip saved!", trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Trip ───────────────────────────────────────────────
// DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      tourist: req.tourist._id,
    });

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    // Remove from tourist's saved trips
    await Tourist.findByIdAndUpdate(req.tourist._id, {
      $pull: { savedTrips: req.params.id },
    });

    res.json({ success: true, message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Generate Packing List ─────────────────────────────────────
// POST /api/trips/packing-list
export const getPackingList = async (req, res) => {
  try {
    const { destination, duration, season } = req.body;

    if (!destination) {
      return res
        .status(400)
        .json({ success: false, message: "Destination is required" });
    }

    const packingList = await generatePackingList({
      destination,
      duration,
      season,
    });

    res.json({ success: true, packingList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};