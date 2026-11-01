
import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all posts - Public
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i"
      };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Post.countDocuments(filter)
    ]);

    res.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// GET single post - Public
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// CREATE post - Authentication required
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      coverImage
    } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content required"
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content,
      excerpt,
      category,
      coverImage,
      author: req.user.id
    });

    await post.populate("author", "name");

    res.status(201).json({
      message: "Story published successfully",
      post
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE own post - Authentication required
router.put("/:id", auth, async (req, res, next) => {
  try {
    const allowed = [
      "title",
      "content",
      "excerpt",
      "category",
      "coverImage"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowed.includes(key)
      )
    );

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.user.id
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate("author", "name");

    if (!post) {
      return res.status(404).json({
        message: "Post not found or not owned by you"
      });
    }

    res.json({
      message: "Story updated successfully",
      post
    });
  } catch (error) {
    next(error);
  }
});

// DELETE own post - Authentication required
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or not owned by you"
      });
    }

    res.json({
      message: "Story deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
