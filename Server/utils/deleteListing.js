const Booking = require("../models/Booking");
const Review = require("../models/Review");
const User = require("../models/User");
const ExpressError = require("./ExpressError");
const { cloudinary } = require("../config/cloudinary");

// Safe delete: upcoming confirmed booking ho to delete block (409). 
// Warna Cloudinary image, reviews aur sabki wishlist se listing remove karke delete karta hai.
module.exports = async function deleteListing(listing) {
  const activeBooking = await Booking.exists({
    listing: listing._id,
    status: "confirmed",
    checkOut: { $gt: new Date() },
  });
  if (activeBooking) {
    throw new ExpressError(409, "Cannot delete: this listing has upcoming confirmed bookings");
  }

  if (listing.image && listing.image.filename && listing.image.filename !== "default-image") {
    await cloudinary.uploader.destroy(listing.image.filename).catch(() => {});
  }
  await Review.deleteMany({ listing: listing._id });
  await User.updateMany({ wishlist: listing._id }, { $pull: { wishlist: listing._id } });
  await listing.deleteOne();
};
