const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "CALLED", "COMPLETED", "NO_SHOW", "CANCELLED"],
      default: "WAITING",
    },
  },
  {
    timestamps: true,
  },
);

// Index for queue position queries
tokenSchema.index({ queueId: 1, tokenNumber: 1 });

// Index for user's tokens lookup
tokenSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Token", tokenSchema);
