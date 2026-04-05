const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    lastTokenNumber: {
      type: Number,
      default: 0,
    },
    currentToken: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  },
);

// Unique index: only one queue per (branch + category + date)
queueSchema.index({ branch: 1, category: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Queue", queueSchema);
