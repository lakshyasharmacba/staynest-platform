const Joi = require("joi");
const { CATEGORIES } = require("./models/Listing");

const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required();
const phone = Joi.string().pattern(/^[6-9]\d{9}$/).messages({
  "string.pattern.base": "Phone must be a valid 10-digit Indian mobile number",
});
const password = Joi.string()
  .min(8)
  .max(64)
  .pattern(/[A-Za-z]/)
  .pattern(/\d/)
  .messages({ "string.pattern.base": "Password must contain at least one letter and one number" });
const otp = Joi.string().pattern(/^\d{6}$/).required().messages({
  "string.pattern.base": "OTP must be 6 digits",
});

module.exports = {
  signup: Joi.object({
    username: Joi.string().trim().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(30).required(),
    email,
    phone: phone.required(),
    password: password.required(),
  }),
  login: Joi.object({ email, password: Joi.string().required() }),
  verifyOtp: Joi.object({ email, otp }),
  resendOtp: Joi.object({ email, purpose: Joi.string().valid("signup", "reset").required() }),
  forgot: Joi.object({ email }),
  reset: Joi.object({ email, otp, newPassword: password.required() }),
  profile: Joi.object({ phone: phone.required() }),

  listing: Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    location: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    maxGuests: Joi.number().integer().min(1).max(20).default(2),
    category: Joi.string().valid(...CATEGORIES).default("Rooms"),
  }),
  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(3).max(1000).required(),
  }),
  booking: Joi.object({
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().required(),
    guests: Joi.number().integer().min(1).required(),
  }),
  verifyPayment: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
  blockUser: Joi.object({
    blocked: Joi.boolean().required(),
  }),
};
