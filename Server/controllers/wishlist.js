const User = require("../models/User");
const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError");

module.exports.list = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ listings: user.wishlist.filter(Boolean) }); // delete ho chuki listing (null) hata do
};

module.exports.add = async (req, res) => {
  const { listingId } = req.params;
  if (!(await Listing.exists({ _id: listingId }))) throw new ExpressError(404, "Listing not found");
  // $addToSet = duplicate nahi banta (dobara click pe bhi ek hi baar)
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: listingId } });
  res.json({ message: "Added to wishlist" });
};

module.exports.remove = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.listingId } });
  res.json({ message: "Removed from wishlist" });
};
