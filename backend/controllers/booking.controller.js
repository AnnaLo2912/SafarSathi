import Booking from "../models/Booking.model.js";
import Guide from "../models/Guide.model.js";

const actionToStatus = {
  accept: "confirmed",
  reject: "rejected",
  complete: "completed",
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      guide_id,
      guideName,
      touristName,
      date,
      time,
      duration,
      location,
      notes,
      price,
    } = req.body;

    if (!guide_id || !date || !time || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "guide_id, date, time, duration and location are required",
      });
    }

    const guide = await Guide.findOne({ user_id: guide_id });
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    if (!guide.availability) {
      return res.status(400).json({
        success: false,
        message: "Guide is currently offline",
      });
    }

    if (guide.is_deactivated) {
      return res.status(400).json({
        success: false,
        message: "Guide account is deactivated",
      });
    }

    const booking = await Booking.create({
      tourist_id: req.user.uid,
      touristName: touristName || req.user.name || "Tourist",
      guide_id,
      guideName: guideName || guide.name,
      date,
      time,
      duration,
      location,
      notes: notes || "",
      price: typeof price === "number" ? price : guide.price,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking request sent",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/bookings/:id
export const updateBookingStatus = async (req, res) => {
  try {
    const { action, status } = req.body;
    const nextStatus = actionToStatus[action] || status;

    if (!["confirmed", "rejected", "completed"].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid action required: accept, reject or complete",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.guide_id !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Only assigned guide can update this booking",
      });
    }

    // Prevent state regressions to keep lifecycle strict.
    const invalidTransitions = {
      pending: ["completed"],
      rejected: ["confirmed", "completed"],
      completed: ["confirmed", "rejected"],
      confirmed: ["rejected"],
    };

    if (invalidTransitions[booking.status]?.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move booking from ${booking.status} to ${nextStatus}`,
      });
    }

    booking.status = nextStatus;
    await booking.save();

    return res.json({
      success: true,
      message: `Booking marked as ${nextStatus}`,
      booking,
      touristNotification:
        nextStatus === "rejected"
          ? "Request declined"
          : nextStatus === "confirmed"
            ? "Booking confirmed"
            : "Trip completed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/bookings?role=guide|tourist
export const getBookings = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !["guide", "tourist"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role query must be guide or tourist",
      });
    }

    const query =
      role === "guide"
        ? { guide_id: req.user.uid }
        : { tourist_id: req.user.uid };

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
