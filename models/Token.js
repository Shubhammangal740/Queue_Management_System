const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "CALLED", "COMPLETED", "SKIPPED", "CANCELLED"],
      default: "WAITING",
    },
  },
  {
    timestamps: true,
  },
);

// Index for queue position queries
tokenSchema.index({ queue: 1, tokenNumber: 1 });

// Index for user's tokens lookup
tokenSchema.index({ user: 1, scheduledDate: -1 });

// Index to check duplicate bookings
tokenSchema.index({ user: 1, queue: 1, status: 1 });

module.exports = mongoose.model("Token", tokenSchema);
