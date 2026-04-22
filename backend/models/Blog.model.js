import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    // Author
    firebaseUid:  { type: String, required: true, index: true },
    authorName:   { type: String, required: true, trim: true },
    authorEmail:  { type: String, default: "" },

    // Content
    title:        { type: String, required: true, trim: true },
    destination:  { type: String, required: true, trim: true },
    duration:     { type: String, default: "" },
    travelDate:   { type: String, default: "" },
    coverImage:   { type: String, default: "" },
    story:        { type: String, required: true },
    highlights:   { type: [String], default: [] },
    tips:         { type: [String], default: [] },
    budget:       { type: String, default: "" },
    rating:       { type: Number, min: 1, max: 5, default: 5 },

    // Template type
    holidayType: {
      type: String,
      enum: ["beach", "mountains", "heritage", "adventure", "food"],
      required: true,
    },

    // Likes — array of firebaseUids who liked
    likes:     { type: [String], default: [] },
    likeCount: { type: Number,   default: 0  },

    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogSchema.index({ holidayType: 1, createdAt: -1 });
blogSchema.index({ likeCount: -1 });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;