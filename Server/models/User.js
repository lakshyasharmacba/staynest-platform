const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, match: /^[6-9]\d{9}$/ },
    password: { type: String, select: false }, // normal signup me bcrypt hash, Google users me optional
    googleId: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  },
  { timestamps: true }
);

// OTP verify nahi kiya? 24 ghante baad account apne aap delete (TTL + partial index)
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 24 * 60 * 60, partialFilterExpression: { isVerified: false } }
);

module.exports = mongoose.model("User", userSchema);
