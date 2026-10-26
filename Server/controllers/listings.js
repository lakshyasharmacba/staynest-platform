const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const geocode = require("../utils/geocode");
const escapeRegex = require("../utils/escapeRegex");
const deleteListing = require("../utils/deleteListing");
const { cloudinary } = require("../config/cloudinary");

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  filename: "default-image",
};

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { avgRating: -1, reviewCount: -1 },
};

module.exports.index = async (req, res) => {
  const { category, minPrice, maxPrice, sort = "newest" } = req.query;
  const search = typeof req.query.search === "string" ? req.query.search : "";

  // FIX: `page` pehle define hi nahi tha -> ReferenceError -> 500 -> "We couldn't load the stays"
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 24);

  const filter = {};
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: rx }, { location: rx }, { country: rx }, { description: rx }];
  }
  if (category) filter.category = category;

  const min = Number(minPrice);
  const max = Number(maxPrice);
  if ((minPrice && !Number.isNaN(min)) || (maxPrice && !Number.isNaN(max))) {
    filter.price = {};
    if (minPrice && !Number.isNaN(min)) filter.price.$gte = min;
    if (maxPrice && !Number.isNaN(max)) filter.price.$lte = max;
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter).sort(SORTS[sort] || SORTS.newest).skip((page - 1) * limit).limit(limit),
    Listing.countDocuments(filter),
  ]);
  res.json({ listings, page, total, totalPages: Math.ceil(total / limit) });
};

// Host ki apni saari listings (dashboard ke liye)
module.exports.mine = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).sort("-createdAt");
  res.json({ listings });
};

module.exports.show = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner", "username"); // phone/email expose nahi
  if (!listing) throw new ExpressError(404, "Listing not found");
  const reviews = await Review.find({ listing: listing._id }).populate("author", "username").sort("-createdAt");
  res.json({ listing, reviews });
};

module.exports.create = async (req, res) => {
  const { location, country } = req.body;
  const coordinates = await geocode(location, country);
  const image = req.file ? { url: req.file.path, filename: req.file.filename } : DEFAULT_IMAGE;

  const listing = await Listing.create({
    ...req.body,
    image,
    owner: req.user._id,
    geometry: { type: "Point", coordinates },
  });
  res.status(201).json({ listing });
};

module.exports.update = async (req, res) => {
  const listing = req.listing;
  const { location, country } = req.body;

  if (location !== listing.location || country !== listing.country) {
    listing.geometry = { type: "Point", coordinates: await geocode(location, country) };
  }
  if (req.file) {
    if (listing.image && listing.image.filename && listing.image.filename !== "default-image") {
      await cloudinary.uploader.destroy(listing.image.filename).catch(() => {});
    }
    listing.image = { url: req.file.path, filename: req.file.filename };
  }
  Object.assign(listing, req.body);
  await listing.save();
  res.json({ listing });
};

module.exports.destroy = async (req, res) => {
  await deleteListing(req.listing);
  res.json({ message: "Listing deleted" });
};