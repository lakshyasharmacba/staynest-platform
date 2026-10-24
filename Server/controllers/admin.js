const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const ExpressError = require("../utils/ExpressError");
const escapeRegex = require("../utils/escapeRegex");
const deleteListing = require("../utils/deleteListing");

// 1. Admin Dashboard Stats: Platform ke main numbers
module.exports.getStats = async (req, res) => {
  const [totalUsers, blockedUsers, totalListings, revenueResult, statusCounts] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isBlocked: true }),
    Listing.countDocuments({}),
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const revenue = revenueResult[0]?.total || 0;
  const bookings = { pending: 0, confirmed: 0, cancelled: 0, expired: 0 };
  statusCounts.forEach((s) => {
    if (bookings[s._id] !== undefined) bookings[s._id] = s.count;
  });

  res.json({
    users: totalUsers,
    blockedUsers,
    listings: totalListings,
    revenue,
    bookings,
  });
};

// 2. Users List & Search (Pagination: 15 per page)
module.exports.getUsers = async (req, res) => {
  const { search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 15, 50);

  const filter = {};
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ username: rx }, { email: rx }, { phone: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("username email phone role isBlocked isVerified createdAt")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
};

// 3. User Block / Unblock with Audit Logging
module.exports.blockUser = async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  const user = await User.findById(id);
  if (!user) throw new ExpressError(404, "User not found");

  if (user._id.equals(req.user._id)) {
    throw new ExpressError(400, "You cannot block yourself");
  }
  if (user.role === "admin") {
    throw new ExpressError(400, "Admins cannot be blocked");
  }

  user.isBlocked = Boolean(blocked);
  await user.save();

  // Audit Log record karo taaki pata rahe kis admin ne kab action liya
  await AuditLog.create({
    admin: req.user._id,
    action: user.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
    targetType: "User",
    targetId: user._id,
    details: { username: user.username, email: user.email },
  });

  res.json({
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
    user: { id: user._id, username: user.username, email: user.email, isBlocked: user.isBlocked },
  });
};

// 4. Listings Moderation List & Search
module.exports.getListings = async (req, res) => {
  const { search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 15, 50);

  const filter = {};
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: rx }, { location: rx }, { country: rx }];
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate("owner", "username email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  res.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
};

// 5. Delete Any Listing (Safe delete rule apply hoga)
module.exports.deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  await deleteListing(listing);

  // Audit Log record karo
  await AuditLog.create({
    admin: req.user._id,
    action: "DELETE_LISTING",
    targetType: "Listing",
    targetId: listing._id,
    details: { title: listing.title, owner: listing.owner },
  });

  res.json({ message: "Listing deleted" });
};

// 6. View All Bookings with Optional Status Filter
module.exports.getBookings = async (req, res) => {
  const { status } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 15, 50);

  const filter = {};
  if (status && ["pending", "confirmed", "cancelled", "expired"].includes(status)) {
    filter.status = status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("listing", "title location country")
      .populate("guest", "username email phone")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
};

// 7. Audit Log History (Newest first)
module.exports.getLogs = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const [logs, total] = await Promise.all([
    AuditLog.find({})
      .populate("admin", "username email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments({}),
  ]);

  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
};
