import express from "express";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import {
  getBlogs, getBlog, createBlog, toggleLike, deleteBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/",           getBlogs);          // public
router.get("/:id",        getBlog);           // public
router.post("/",          protect, createBlog);
router.patch("/:id/like", protect, toggleLike);
router.delete("/:id",     protect, deleteBlog);

export default router;