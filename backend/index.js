import dotenv from "dotenv";
dotenv.config(); // Load environment variables FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ============================================
// Import all route modules
// ============================================
import authRoutes from "./route/authRoutes.js";
import productRoutes from "./route/productRoutes.js";
import orderRoutes from "./route/orderRoutes.js";
import cartRoutes from "./route/cartRoutes.js";
import reviewRoutes from "./route/reviewRoutes.js";
import analyticsRoutes from "./route/analyticsRoutes.js";



// ============================================
// Initialize Express app
// ============================================
const app = express();

// ============================================
// Middleware Configuration
// ============================================

// CORS configuration - Allow requests from any origin
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Body parsing middleware - Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware - Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// API Routes
// ============================================

// Root endpoint - API information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InsightMart API Server is running!",
    version: "1.0.0",
    documentation: {
      endpoints: {
        auth: {
          base: "/api/auth",
          routes: ["POST /signup", "POST /login"],
        },
        products: {
          base: "/api/products",
          routes: [
            "GET /",
            "GET /search",
            "GET /filter",
            "GET /:id",
            "POST /",
            "POST /bulk",
            "PUT /:id",
            "PATCH /:id/price-discount",
            "DELETE /:id",
            "DELETE /",
          ],
        },
        orders: {
          base: "/api/orders",
          routes: ["POST /create", "GET /my-orders"],
        },
        cart: {
          base: "/api/cart",
          routes: ["POST /add", "GET /my-cart", "PUT /update", "DELETE /remove"],
        },
        reviews: {
          base: "/api/reviews",
          routes: ["POST /", "GET /:productId", "DELETE /:id"],
        },
        health: {
          base: "/health",
          routes: ["GET /"],
        },
      },
    },
  });
});

// Authentication routes - Public routes
app.use("/api/auth", authRoutes);

// Product routes - Protected routes (require authentication)
app.use("/api/products", productRoutes);

// Order routes - Protected routes (require authentication)
app.use("/api/orders", orderRoutes);

// Cart routes - Protected routes (require authentication)
app.use("/api/cart", cartRoutes);

// Review routes - Protected routes (require authentication)
app.use("/api/reviews", reviewRoutes);

// Analytics routes - Protected routes (require authentication)
app.use("/api/analytics", analyticsRoutes);

// ============================================
// Utility Endpoints
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InsightMart API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      cart: "/api/cart",
      reviews: "/api/reviews",
    },
  });
});

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler - Must come AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      "/api/auth",
      "/api/products",
      "/api/orders",
      "/api/cart",
      "/api/reviews",
      "/health",
    ],
  });
});

// Global error handler - Must come LAST
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: err.message || "Authentication failed",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// Database Connection
// ============================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully 🚀");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 InsightMart API Server Started");
  console.log("=".repeat(50));
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`📍 Local URL: http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API info: http://localhost:${PORT}/api`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50) + "\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
