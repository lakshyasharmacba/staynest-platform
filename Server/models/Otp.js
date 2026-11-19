const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  purpose: { 
    type: String, 
    enum: ["signup", "reset", "email-change"],   // ← email-change add
    required: true 
  },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);