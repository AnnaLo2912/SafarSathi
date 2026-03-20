import Guide from "../models/Guide.model.js";

// POST /api/guide/availability
export const toggleAvailability = async (req, res) => {
  try {
    const { availability, location, rating, price, name } = req.body;

    if (typeof availability !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "availability must be true or false",
      });
    }

    const guide = await Guide.findOneAndUpdate(
      { user_id: req.user.uid },
      {
        user_id: req.user.uid,
        name: name || req.user.name || "Local Guide",
        availability,
        location: location || "",
        rating: typeof rating === "number" ? rating : 4.5,
        price: typeof price === "number" ? price : 1500,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
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
    }

    const guides = await Guide.find(query).sort({ rating: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: guides.length,
      guides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
