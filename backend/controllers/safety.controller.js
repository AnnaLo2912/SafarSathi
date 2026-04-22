import twilio        from "twilio";
import SafetyProfile from "../models/Safety.model.js";
import Booking       from "../models/Booking.model.js";
import Guide         from "../models/Guide.model.js";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

// ── Helper: send SMS via Twilio ───────────────────────────────
async function sendSMS(to, message) {
  try {
    let normalized = to.replace(/\s+/g, "").replace(/-/g, "");
    if (!normalized.startsWith("+")) {
      const digits = normalized.replace(/\D/g, "").slice(-10);
      if (digits.length !== 10) {
        return { success: false, to, error: "Invalid Indian mobile number" };
      }
      normalized = `+91${digits}`;
    }

    const msg = await twilioClient.messages.create({
      body: message,
      from: FROM_NUMBER,
      to:   normalized,
    });

    console.log(`SMS sent to ${normalized} — SID: ${msg.sid}`);
    return { success: true, to: normalized, sid: msg.sid };
  } catch (err) {
    console.error(`SMS failed to ${to}:`, err.message);
    return { success: false, to, error: err.message };
  }
}

// ── GET /api/safety/profile ───────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    let profile = await SafetyProfile.findOne({ firebaseUid: req.user.uid });
    if (!profile) {
      profile = await SafetyProfile.create({
        firebaseUid: req.user.uid,
        userName:    req.user.name || "",
      });
    }
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/safety/contacts ─────────────────────────────────
export const addContact = async (req, res) => {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }
    const profile = await SafetyProfile.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $push: { emergencyContacts: { name, phone, relation: relation || "Friend" } } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, contacts: profile.emergencyContacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/safety/contacts/:contactId ────────────────────
export const deleteContact = async (req, res) => {
  try {
    const profile = await SafetyProfile.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $pull: { emergencyContacts: { _id: req.params.contactId } } },
      { new: true }
    );
    return res.json({ success: true, contacts: profile?.emergencyContacts || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/safety/profile ─────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { userPhone, userName } = req.body;
    const profile = await SafetyProfile.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: { ...(userPhone && { userPhone }), ...(userName && { userName }) } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/safety/sos ──────────────────────────────────────
export const triggerSOS = async (req, res) => {
  try {
    const { lat, lon, accuracy } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: "GPS coordinates required" });
    }

    const profile  = await SafetyProfile.findOne({ firebaseUid: req.user.uid });
    const userName = profile?.userName || req.user.email || "A SafarSathi tourist";
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;

    const sosMessage = `🚨 EMERGENCY ALERT from SafarSathi\n\n${userName} has triggered a panic alert!\n\n📍 Location: ${mapsLink}\n\nPlease call them or contact emergency services (112) immediately.\n\n— SafarSathi Safety System`;

    const results       = [];
    const sentTo        = [];
    const guidesAlerted = [];

    // 1. Personal emergency contacts
    if (profile?.emergencyContacts?.length > 0) {
      for (const contact of profile.emergencyContacts) {
        const result = await sendSMS(contact.phone, sosMessage);
        sentTo.push({
          name:   contact.name,
          phone:  contact.phone,
          status: result.success ? "sent" : "failed",
          error:  result.error,
        });
        results.push(result);
      }
    }

    // 2. Active/confirmed guide
    const activeBooking = await Booking.findOne({
      tourist_id: req.user.uid,
      status:     { $in: ["confirmed", "active"] },
    }).sort({ createdAt: -1 });

    console.log("Active booking found:", activeBooking);

    if (activeBooking) {
      // FIX: never use _id with a Firebase UID string — only query string fields
      const guide = await Guide.findOne({
        $or: [
          { user_id:     activeBooking.guide_id },
          { firebaseUid: activeBooking.guide_id },
        ],
      });

      console.log("Guide found:", guide);

      if (guide?.phone) {
        const guideMsg = `🚨 SafarSathi EMERGENCY\n\nYour tourist ${userName} has triggered a panic alert!\n\n📍 Location: ${mapsLink}\n\nPlease respond immediately or call 112.`;
        const result   = await sendSMS(guide.phone, guideMsg);
        guidesAlerted.push({
          guideId:   guide.user_id || guide.firebaseUid,
          guideName: guide.name,
          phone:     guide.phone,
          status:    result.success ? "sent" : "failed",
          error:     result.error,
        });
        results.push(result);
      } else {
        console.warn("Guide found but has no phone number:", guide?._id);
      }
    } else {
      console.warn("No active booking found for tourist:", req.user.uid);
    }

    // 3. Persist SOS to history
    await SafetyProfile.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      {
        $push: {
          sosHistory: {
            triggeredAt: new Date(),
            lat:         parseFloat(lat),
            lon:         parseFloat(lon),
            accuracy:    parseFloat(accuracy) || 0,
            sentTo,
            guidesAlerted,
            resolved:    false,
          },
        },
      },
      { upsert: true }
    );

    const totalSent = results.filter(r => r.success).length;
    return res.json({
      success:       true,
      message:       `SOS sent to ${totalSent} contact${totalSent !== 1 ? "s" : ""}`,
      sentTo,
      guidesAlerted,
      mapsLink,
    });

  } catch (err) {
    console.error("SOS error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/safety/sos/:alertId/resolve ────────────────────
export const resolveAlert = async (req, res) => {
  try {
    await SafetyProfile.updateOne(
      { firebaseUid: req.user.uid, "sosHistory._id": req.params.alertId },
      { $set: { "sosHistory.$.resolved": true, "sosHistory.$.resolvedAt": new Date() } }
    );
    return res.json({ success: true, message: "Alert resolved" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};