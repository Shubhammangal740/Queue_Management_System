const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getSlotPreview } = require("../controllers/queueController");
const { param, query } = require("express-validator");
const { isValidObjectId, validate } = require("../middleware/validators");

const router = express.Router();

// Validators
const slotPreviewValidator = [
  param("branchId")
    .notEmpty()
    .withMessage("branchId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid branchId format");
      }
      return true;
    }),
  param("categoryId")
    .notEmpty()
    .withMessage("categoryId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid categoryId format");
      }
      return true;
    }),
  query("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  validate,
];

// ==================== SLOT PREVIEW ROUTES ====================

// Get slot preview for booking
// Shows queue info before user books a token
router.get(
  "/:branchId/:categoryId",
  protect,
  slotPreviewValidator,
  getSlotPreview,
);

module.exports = router;
