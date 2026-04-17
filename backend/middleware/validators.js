const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Helper: Check if value is valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// ==================== AUTH VALIDATORS ====================

const signupValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// ==================== TOKEN VALIDATORS ====================

const createTokenValidator = [
  body("serviceId")
    .notEmpty()
    .withMessage("serviceId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid serviceId format");
      }
      return true;
    }),
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
  body("scheduledDate")
    .optional()
    .isISO8601()
    .withMessage("scheduledDate must be a valid date (ISO8601 format)"),
  validate,
];

const tokenIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Token ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid Token ID format");
      }
      return true;
    }),
  validate,
];

const myTokensQueryValidator = [
  query("status")
    .optional()
    .isIn(["WAITING", "CALLED", "COMPLETED", "SKIPPED", "CANCELLED"])
    .withMessage("Invalid status value"),
  query("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid date (ISO8601 format)"),
  query("grouped")
    .optional()
    .isIn(["true", "false"])
    .withMessage("grouped must be 'true' or 'false'"),
  validate,
];

// ==================== QUERY VALIDATORS ====================

const serviceIdQueryValidator = [
  query("serviceId")
    .optional()
    .custom((value) => {
      if (value && !isValidObjectId(value)) {
        throw new Error("Invalid serviceId format");
      }
      return true;
    }),
  validate,
];

const branchIdQueryValidator = [
  query("branchId")
    .optional()
    .custom((value) => {
      if (value && !isValidObjectId(value)) {
        throw new Error("Invalid branchId format");
      }
      return true;
    }),
  validate,
];

module.exports = {
  validate,
  isValidObjectId,
  signupValidator,
  loginValidator,
  createTokenValidator,
  tokenIdValidator,
  myTokensQueryValidator,
  serviceIdQueryValidator,
  branchIdQueryValidator,
};
