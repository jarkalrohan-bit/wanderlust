
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000"
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200
}));

app.get("/health", (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({
      status: mongoose.connection.readyState === 1 ? "healthy" : "unhealthy",
      database: mongoose.connection.readyState === 1
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource ID" });
  }

  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WanderLust API running on port ${PORT}`);
  });
} catch (error) {
  console.error("Application startup failed:", error.message);
  process.exit(1);
}

