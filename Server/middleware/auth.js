const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError");

// Login check: JWT httpOnly cookie se padhta hai
module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) throw new ExpressError(401, "Please login first");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ExpressError(401, "Session expired, please login again");
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isVerified) throw new ExpressError(401, "Please login first");
  if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");
  req.user = user;
  next();
};

// Sirf listing ka owner hi edit/delete kar sakta hai
module.exports.isOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  if (!listing.owner.equals(req.user._id)) throw new ExpressError(403, "You are not the owner of this listing");
  req.listing = listing;
  next();
};

// Sirf admin hi admin routes access kar sakta hai
module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") throw new ExpressError(403, "Admin access required");
  next();
};
