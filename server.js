const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10kb" }));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const branchRoutes = require("./routes/branchRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const queueRoutes = require("./routes/queueRoutes");
const slotRoutes = require("./routes/slotRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/slots", slotRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Queue Management System API is running",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
