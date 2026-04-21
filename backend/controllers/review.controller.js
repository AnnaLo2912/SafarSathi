import Booking from "../models/Booking.model.js";
import Guide from "../models/Guide.model.js";
import Review from "../models/Review.model.js";

function normalizeReviewText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseRating(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return null;
  return parsed;
}

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { booking_id, rating, review_text } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "booking_id is required",
      });
    }

    const parsedRating = parseRating(rating);
    if (!parsedRating) {
      return res.status(400).json({
        success: false,
        message: "rating must be an integer between 1 and 5",
      });
    }

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.tourist_id !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Only the booking tourist can submit a review",
      });
    }

    if (booking.guide_id === req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Guides are not allowed to submit reviews",
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Reviews are allowed only for completed bookings",
      });
    }

    const existingReview = await Review.findOne({ booking_id: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    const review = await Review.create({
      booking_id: booking._id,
      tourist_id: req.user.uid,
      guide_id: booking.guide_id,
      rating: parsedRating,
      review_text: normalizeReviewText(review_text),
    });

    const guide = await Guide.findOne({ user_id: booking.guide_id });
    let avgRating = 0;
    let totalReviews = 0;

    if (guide) {
      const oldTotal = Number.isFinite(guide.total_reviews) ? guide.total_reviews : 0;
      const oldAvg = oldTotal > 0
        ? Number(guide.avg_rating ?? guide.rating ?? 0)
        : 0;

      const newAvg = ((oldAvg * oldTotal) + parsedRating) / (oldTotal + 1);

      guide.avg_rating = Number(newAvg.toFixed(2));
      guide.total_reviews = oldTotal + 1;
      guide.rating = guide.avg_rating;
      await guide.save();

      avgRating = guide.avg_rating;
      totalReviews = guide.total_reviews;
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted",
      review,
      avg_rating: avgRating,
      total_reviews: totalReviews,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/reviews?guide_id=...
export const getGuideReviews = async (req, res) => {
  try {
    const guideIdFromQuery = typeof req.query.guide_id === "string"
      ? req.query.guide_id.trim()
      : "";
    const guide_id = guideIdFromQuery || req.user.uid;
    if (!guide_id) {
      return res.status(400).json({
        success: false,
        message: "guide_id query param is required",
      });
    }

    const rawReviews = await Review.find({ guide_id }).sort({ created_at: -1 }).lean();
    const relatedBookingIds = rawReviews
      .map((review) => review.booking_id)
      .filter(Boolean);
    const relatedBookings = relatedBookingIds.length > 0
      ? await Booking.find({ _id: { $in: relatedBookingIds } })
          .select("_id touristName date time")
          .lean()
      : [];

    const bookingById = new Map(
      relatedBookings.map((booking) => [String(booking._id), booking])
    );

    const reviews = rawReviews.map((review) => {
      const booking = bookingById.get(String(review.booking_id));
      return {
        ...review,
        tourist_name: booking?.touristName || "Tourist",
        booking_date: booking?.date || null,
        booking_time: booking?.time || null,
      };
    });

    const guide = await Guide.findOne({ user_id: guide_id }).select("avg_rating total_reviews rating");

    const calculatedTotal = reviews.length;
    const calculatedAvg = calculatedTotal > 0
      ? reviews.reduce((sum, item) => sum + item.rating, 0) / calculatedTotal
      : 0;

    let avgRating = calculatedAvg;
    let totalReviews = calculatedTotal;

    if (guide) {
      const storedTotal = Number.isFinite(guide.total_reviews) ? guide.total_reviews : 0;
      const storedAvg = storedTotal > 0
        ? Number(guide.avg_rating ?? guide.rating ?? 0)
        : 0;

      const isOutOfSync = storedTotal !== calculatedTotal
        || Math.abs(storedAvg - calculatedAvg) > 0.01;

      if (!isOutOfSync) {
        avgRating = storedAvg;
        totalReviews = storedTotal;
      } else {
        guide.total_reviews = calculatedTotal;
        guide.avg_rating = Number(calculatedAvg.toFixed(2));
        guide.rating = guide.avg_rating;
        await guide.save();
      }
    }

    return res.json({
      success: true,
      guide_id,
      avg_rating: Number(avgRating.toFixed(2)),
      total_reviews: totalReviews,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/reviews/:booking_id
export const getReviewForBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const booking = await Booking.findById(booking_id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isParticipant = booking.tourist_id === req.user.uid || booking.guide_id === req.user.uid;
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Only booking participants can view this review",
      });
    }

    const review = await Review.findOne({ booking_id: booking._id });

    return res.json({
      success: true,
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
