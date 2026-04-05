const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  callNextToken,
  getQueueStatus,
  getWaitingTokens,
  getLiveQueue,
} = require("../controllers/queueController");
const { body, query, param } = require("express-validator");
const { isValidObjectId, validate } = require("../middleware/validators");

const router = express.Router();

// Validators
const callNextValidator = [
  body("branchId")
    .notEmpty()
    .withMessage("branchId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid branchId format");
      }
      return true;
    }),
  body("categoryId")
    .notEmpty()
    .withMessage("categoryId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid categoryId format");
      }
      return true;
    }),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date"),
  validate,
];

const queueQueryValidator = [
  query("branchId")
    .notEmpty()
    .withMessage("branchId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid branchId format");
      }
      return true;
    }),
  query("categoryId")
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

const liveQueueParamValidator = [
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

// ==================== PUBLIC ROUTES ====================

// Get live queue status (for display screens and users)
router.get("/:branchId/:categoryId", liveQueueParamValidator, getLiveQueue);

// ==================== STAFF/ADMIN ROUTES ====================

// Call next token in queue
router.post(
  "/next",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  callNextValidator,
  callNextToken,
);

// Get queue status (detailed - for staff dashboard)
router.get(
  "/status",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  queueQueryValidator,
  getQueueStatus,
);

// Get waiting tokens list
router.get(
  "/waiting",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  queueQueryValidator,
  getWaitingTokens,
);

module.exports = router;
