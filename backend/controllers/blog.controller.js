import Blog from "../models/Blog.model.js";

// GET /api/blogs — public, all published blogs
export const getBlogs = async (req, res) => {
  try {
    const { type, sort = "newest", page = 1, limit = 12 } = req.query;
    const filter = { published: true };
    if (type && type !== "all") filter.holidayType = type;

    const sortObj = sort === "popular" ? { likeCount: -1 } : { createdAt: -1 };

    const blogs = await Blog.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Blog.countDocuments(filter);

    return res.json({ success: true, blogs, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blogs/:id — single blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    return res.json({ success: true, blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/blogs — create (protected)
export const createBlog = async (req, res) => {
  try {
    const {
      title, destination, duration, travelDate,
      coverImage, story, highlights, tips,
      budget, rating, holidayType,
    } = req.body;

    if (!title || !destination || !story || !holidayType) {
      return res.status(400).json({
        success: false,
        message: "title, destination, story and holidayType are required",
      });
    }

    const blog = await Blog.create({
      firebaseUid:  req.user.uid,
      authorName:   req.user.name || req.user.email?.split("@")[0] || "Traveller",
      authorEmail:  req.user.email || "",
      title, destination, duration, travelDate,
      coverImage: coverImage || "",
      story,
      highlights: Array.isArray(highlights) ? highlights.filter(Boolean) : [],
      tips:       Array.isArray(tips)       ? tips.filter(Boolean)       : [],
      budget,
      rating:     parseInt(rating) || 5,
      holidayType,
    });

    return res.status(201).json({ success: true, message: "Blog published!", blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/blogs/:id/like — toggle like (protected)
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const uid      = req.user.uid;
    const liked    = blog.likes.includes(uid);

    if (liked) {
      blog.likes     = blog.likes.filter(id => id !== uid);
      blog.likeCount = Math.max(0, blog.likeCount - 1);
    } else {
      blog.likes.push(uid);
      blog.likeCount += 1;
    }

    await blog.save();
    return res.json({ success: true, liked: !liked, likeCount: blog.likeCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/blogs/:id — only author can delete (protected)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, firebaseUid: req.user.uid });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found or not yours" });
    return res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};