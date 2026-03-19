import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const touristSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // don't return password by default
    },
    phone: { type: String, default: "" },
    nationality: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },

    // Saved trips
    savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],

    role: {
      type: String,
      enum: ["tourist", "admin"],
      default: "tourist",
    },
  },
  { timestamps: true }
);

// Hash password before saving
touristSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
touristSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Tourist = mongoose.model("Tourist", touristSchema);
export default Tourist;