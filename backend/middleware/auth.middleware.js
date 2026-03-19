import jwt from "jsonwebtoken";
import Tourist from "../models/Tourist.model.js";

// Must be logged in
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tourist = await Tourist.findById(decoded.id).select("-password");

    if (!req.tourist) {
      return res
        .status(401)
        .json({ success: false, message: "Tourist not found" });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};

// Optional — attaches tourist if token present, continues if not
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.tourist = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tourist = await Tourist.findById(decoded.id).select("-password");
  } catch {
    req.tourist = null;
  }

  next();
};