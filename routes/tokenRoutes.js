const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createToken,
  getTokenDetails,
  getMyTokens,
  cancelToken,
  completeToken,
  skipToken,
  requeueToken,
} = require("../controllers/tokenController");
const {
  createTokenValidator,
  tokenIdValidator,
  myTokensQueryValidator,
} = require("../middleware/validators");

const router = express.Router();

// ==================== CUSTOMER ROUTES ====================

// Create a new token
router.post("/", protect, createTokenValidator, createToken);

// Get user's own tokens (both /my and /my-tokens work)
router.get("/my", protect, myTokensQueryValidator, getMyTokens);
router.get("/my-tokens", protect, myTokensQueryValidator, getMyTokens);

// Get token details by ID
router.get("/:id", protect, tokenIdValidator, getTokenDetails);

// Cancel a token (customer can cancel their own)
router.patch("/:id/cancel", protect, tokenIdValidator, cancelToken);

// ==================== STAFF/ADMIN ROUTES ====================

// Complete a token (Staff/Admin only)
router.post(
  "/:id/complete",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  tokenIdValidator,
  completeToken,
);

// Skip a token (Staff/Admin only)
router.post(
  "/:id/skip",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  tokenIdValidator,
  skipToken,
);

// Re-queue a skipped token (Staff/Admin only)
router.post(
  "/:id/requeue",
  protect,
  authorizeRoles("STAFF", "ADMIN"),
  tokenIdValidator,
  requeueToken,
);

module.exports = router;
