import Trip from "../models/Trip.model.js";
import { generateItinerary, generatePackingList } from "../services/gemini.service.js";

// ── Generate AI Trip ──────────────────────────────────────────
export const generateTrip = async (req, res) => {
  try {
    const { destination, duration, budget, travelers, tripStyle, startDate, currency, exchangeRate } = req.body;

    if (!destination || !duration || !budget) {
      return res.status(400).json({ success: false, message: "Destination, duration and budget are required" });
    }

    let parsedStartDate = undefined;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date format" });
      }
    }

    console.log(`🤖 Generating itinerary for ${destination}...`);

    const aiData = await generateItinerary({
      destination,
      duration:  parseInt(duration),
      budget:    parseFloat(budget),
      travelers: parseInt(travelers) || 1,
      tripStyle: tripStyle || "budget",
      startDate: parsedStartDate,
    });

    const tripData = {
      destination,
      duration:     parseInt(duration),
      budget:       parseFloat(budget),
      travelers:    parseInt(travelers) || 1,
      tripStyle:    tripStyle || "budget",
      startDate:    parsedStartDate,
      currency:     currency || "USD",
      exchangeRate: parseFloat(exchangeRate) || 83,
      isCustom:     false,
      ...aiData,
    };

    if (req.user) {
      tripData.firebaseUid = req.user.uid;
      tripData.userEmail   = req.user.email;
    }

    const trip = await Trip.create(tripData);
    res.status(201).json({ success: true, message: `✈️ ${duration}-night itinerary for ${destination} generated!`, trip });

  } catch (err) {
    console.error("❌ Trip generation error:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate itinerary. Please try again.", error: err.message });
  }
};

// ── Save Custom Itinerary ─────────────────────────────────────
// POST /api/trips/custom
export const saveCustomTrip = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Login required" });

    const { destination, duration, dayPlans, startDate, travelers, tripStyle } = req.body;

    if (!destination || !dayPlans?.length) {
      return res.status(400).json({ success: false, message: "Destination and at least one day are required" });
    }

    const trip = await Trip.create({
      firebaseUid: req.user.uid,
      userEmail:   req.user.email,
      destination,
      duration:    parseInt(duration) || dayPlans.length,
      budget:      0,
      travelers:   parseInt(travelers) || 1,
      tripStyle:   tripStyle || "budget",
      startDate:   startDate ? new Date(startDate) : undefined,
      isCustom:    true,
      status:      "saved",
      dayPlans:    dayPlans.map((d, i) => ({
        day:         i + 1,
        title:       d.title || `Day ${i + 1}`,
        attractions: (d.activities || []).map(a => ({
          name:    a.name  || "",
          timing:  a.time  || "",
          tips:    a.notes || "",
          entryFee:    0,
          entryFeeINR: 0,
        })),
        dayTotal: 0,
      })),
    });

    return res.status(201).json({ success: true, message: "Custom itinerary saved!", trip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update (Edit) Trip ────────────────────────────────────────
// PUT /api/trips/:id/edit  (protected — only owner)
export const editTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, firebaseUid: req.user.uid });
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    const { dayPlans, highlights, summary, travelTips, packingList } = req.body;

    if (dayPlans)    trip.dayPlans    = dayPlans;
    if (highlights)  trip.highlights  = highlights;
    if (summary)     trip.summary     = summary;
    if (travelTips)  trip.travelTips  = travelTips;
    if (packingList) trip.packingList = packingList;

    await trip.save();
    return res.json({ success: true, message: "Trip updated!", trip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Trip ───────────────────────────────────────────
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Trips ──────────────────────────────────────────────
export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ firebaseUid: req.user.uid })
      .sort({ createdAt: -1 })
      .select("destination duration budget tripStyle status startDate createdAt summary highlights lat lon isCustom currency");
    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Save Trip (mark as saved) ─────────────────────────────────
export const saveTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, { status: "saved" }, { new: true });
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    res.json({ success: true, message: "Trip saved! ✅", trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Trip ───────────────────────────────────────────────
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, firebaseUid: req.user.uid });
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    res.json({ success: true, message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Packing List ──────────────────────────────────────────────
export const getPackingList = async (req, res) => {
  try {
    const { destination, duration, season } = req.body;
    if (!destination) return res.status(400).json({ success: false, message: "Destination is required" });
    const packingList = await generatePackingList({ destination, duration, season });
    res.json({ success: true, packingList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};