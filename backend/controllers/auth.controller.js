import jwt from "jsonwebtoken";
import Tourist from "../models/Tourist.model.js";

// Helper — generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// ── Register ──────────────────────────────────────────────────
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, nationality } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const exists = await Tourist.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const tourist = await Tourist.create({
      name,
      email,
      password,
      phone,
      nationality,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(tourist._id),
      tourist: {
        id: tourist._id,
        name: tourist.name,
        email: tourist.email,
        phone: tourist.phone,
        nationality: tourist.nationality,
        role: tourist.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Need password field (it's select: false in schema)
    const tourist = await Tourist.findOne({ email }).select("+password");
    if (!tourist) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await tourist.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(tourist._id),
      tourist: {
        id: tourist._id,
        name: tourist.name,
        email: tourist.email,
        phone: tourist.phone,
        nationality: tourist.nationality,
        role: tourist.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My Profile ────────────────────────────────────────────
// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.tourist._id).populate(
      "savedTrips",
      "destination duration budget status createdAt galleryImages summary"
    );

    res.json({ success: true, tourist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Profile ────────────────────────────────────────────
// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "nationality", "profilePhoto"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const tourist = await Tourist.findByIdAndUpdate(
      req.tourist._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Profile updated", tourist });
  } catch (err) {
  console.log("🔥 FULL ERROR:", err);   // ADD THIS
  res.status(500).json({ success: false, message: err.message });
}
};