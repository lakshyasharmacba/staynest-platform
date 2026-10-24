const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const schemas = require("../schema");
const c = require("../controllers/auth");

// Brute force / OTP spam rokne ke liye: ek IP se 15 min me max 20 requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

router.post("/signup", limiter, validate(schemas.signup), c.signup);
router.post("/verify-otp", limiter, validate(schemas.verifyOtp), c.verifySignupOtp);
router.post("/resend-otp", limiter, validate(schemas.resendOtp), c.resendOtp);
router.post("/login", limiter, validate(schemas.login), c.login);
router.post("/google", limiter, c.googleAuth);
router.post("/logout", c.logout);
router.get("/me", requireAuth, c.me);
router.patch("/me", requireAuth, validate(schemas.profile), c.updateProfile);
router.post("/forgot-password", limiter, validate(schemas.forgot), c.forgotPassword);
router.post("/reset-password", limiter, validate(schemas.reset), c.resetPassword);

module.exports = router;
