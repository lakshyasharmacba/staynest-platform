const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ExpressError = require("../utils/ExpressError");

// Listing ki avgRating + reviewCount dobara calculate (aggregation)
async function refreshRating(listingId) {
  const [stats] = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Listing.findByIdAndUpdate(listingId, {
    avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
}

module.exports.create = async (req, res) => {
  const { listingId } = req.params;
  if (!(await Listing.exists({ _id: listingId }))) throw new ExpressError(404, "Listing not found");

  // Sirf wahi review de sakta hai jiska stay complete ho chuka hai
  const stayed = await Booking.exists({
    listing: listingId,
    guest: req.user._id,
    status: "confirmed",
    checkOut: { $lt: new Date() },
  });
  if (!stayed) throw new ExpressError(403, "You can review only after completing a stay here");

  const review = await Review.create({ ...req.body, listing: listingId, author: req.user._id });
  await refreshRating(listingId);
  res.status(201).json({ review });
};

module.exports.destroy = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ExpressError(404, "Review not found");
  if (!review.author.equals(req.user._id)) throw new ExpressError(403, "You can delete only your own review");
  await review.deleteOne();
  await refreshRating(review.listing);
  res.json({ message: "Review deleted" });
};
