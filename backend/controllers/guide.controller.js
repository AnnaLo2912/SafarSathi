import Guide from "../models/Guide.model.js";
import Booking from "../models/Booking.model.js";
import VerificationAttempt from "../models/VerificationAttempt.model.js";
import Trip from "../models/Trip.model.js";

// POST /api/guide/availability
export const toggleAvailability = async (req, res) => {
  try {
    const { availability, location, price, name } = req.body;

    if (typeof availability !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "availability must be true or false",
      });
    }

    const existingGuide = await Guide.findOne({ user_id: req.user.uid });

    if (existingGuide?.is_deactivated) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please reactivate to go online.",
      });
    }

    if (availability === true && (!existingGuide || !existingGuide.is_verified)) {
      return res.status(403).json({
        success: false,
        message: "Please verify your IITF certification to go online.",
      });
    }

    const fallbackTotalReviews = Number.isFinite(existingGuide?.total_reviews)
      ? existingGuide.total_reviews
      : 0;
    const fallbackAverageRating = fallbackTotalReviews > 0
      ? Number(existingGuide?.avg_rating ?? existingGuide?.rating ?? 0)
      : 0;

    const guide = await Guide.findOneAndUpdate(
      { user_id: req.user.uid },
      {
        user_id: req.user.uid,
        name: name || req.user.name || "Local Guide",
        full_name: name || req.user.name || existingGuide?.full_name || "",
        availability,
        location: location || "",
        rating: fallbackAverageRating,
        avg_rating: fallbackAverageRating,
        total_reviews: fallbackTotalReviews,
        price: typeof price === "number" ? price : 1500,
        is_verified: existingGuide?.is_verified || false,
        verification_status: existingGuide?.verification_status || "not_submitted",
        is_deactivated: existingGuide?.is_deactivated || false,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: availability
        ? "You are Available for bookings"
        : "You are Offline",
      guide,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/guides?available=true
export const getGuides = async (req, res) => {
  try {
    const { available } = req.query;
    const query = {};

    if (available === "true") {
      query.availability = true;
      query.is_verified = true;
      query.is_deactivated = { $ne: true };
    }

    const guides = await Guide.find(query).sort({ avg_rating: -1, total_reviews: -1, createdAt: -1 });

    const normalizedGuides = guides.map((guideDoc) => {
      const guide = guideDoc.toObject();
      const totalReviews = Number.isFinite(guide.total_reviews) ? guide.total_reviews : 0;
      const avgRating = totalReviews > 0
        ? Number(guide.avg_rating ?? guide.rating ?? 0)
        : 0;

      return {
        ...guide,
        avg_rating: Number(avgRating.toFixed(2)),
        total_reviews: totalReviews,
        rating: Number(avgRating.toFixed(2)),
      };
    });

    return res.json({
      success: true,
      count: normalizedGuides.length,
      guides: normalizedGuides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/guide/deactivate
export const deactivateGuideAccount = async (req, res) => {
  try {
    const guide = await Guide.findOneAndUpdate(
      { user_id: req.user.uid },
      {
        $set: {
          is_deactivated: true,
          availability: false,
        },
        $setOnInsert: {
          user_id: req.user.uid,
          name: req.user.name || "Local Guide",
          full_name: req.user.name || "",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Your guide account has been deactivated.",
      guide,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/guide/reactivate
export const reactivateGuideAccount = async (req, res) => {
  try {
    const guide = await Guide.findOneAndUpdate(
      { user_id: req.user.uid },
      {
        $set: {
          is_deactivated: false,
          availability: false,
        },
      },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found",
      });
    }

    return res.json({
      success: true,
      message: "Your guide account has been reactivated. You can enable availability after verification.",
      guide,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/guide/account
export const deleteGuideAccount = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user_id: req.user.uid });

    if (guide) {
      await VerificationAttempt.deleteMany({ guide_id: guide._id });
    }

    const [bookingResult, guideResult, tripResult] = await Promise.all([
      Booking.deleteMany({ guide_id: req.user.uid }),
      Guide.deleteOne({ user_id: req.user.uid }),
      Trip.deleteMany({ firebaseUid: req.user.uid }),
    ]);

    return res.json({
      success: true,
      message: "Guide account data removed from platform database.",
      deleted: {
        guide: guideResult.deletedCount || 0,
        bookings: bookingResult.deletedCount || 0,
        trips: tripResult.deletedCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
