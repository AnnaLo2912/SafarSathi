import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, required: true, trim: true }, // with country code e.g. +919876543210
  relation: { type: String, default: "Friend", trim: true },
}, { _id: true });

const sosAlertSchema = new mongoose.Schema({
  triggeredAt: { type: Date,   default: Date.now },
  lat:         { type: Number, required: true },
  lon:         { type: Number, required: true },
  accuracy:    { type: Number, default: 0 },
  sentTo:      [{ name: String, phone: String, status: String }],
  guidesAlerted: [{ guideId: String, guideName: String, phone: String }],
  resolved:    { type: Boolean, default: false },
  resolvedAt:  { type: Date,   default: null },
}, { _id: true });

const safetyProfileSchema = new mongoose.Schema({
  firebaseUid:       { type: String, required: true, unique: true, index: true },
  userName:          { type: String, default: "" },
  userPhone:         { type: String, default: "" }, // tourist's own phone
  emergencyContacts: [emergencyContactSchema],
  sosHistory:        [sosAlertSchema],
}, { timestamps: true });

const SafetyProfile = mongoose.model("SafetyProfile", safetyProfileSchema);
export default SafetyProfile;