const mongoose = require("mongoose");

const CATEGORIES = ["Rooms", "Trending", "Mountains", "Beach", "City", "Farms", "Camping", "Luxury"];

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { url: String, filename: String },
    price: { type: Number, required: true, min: 0 }, // per night, INR
    maxGuests: { type: Number, default: 2, min: 1 },
    category: { type: String, enum: CATEGORIES, default: "Rooms" },
    location: { type: String, required: true },
    country: { type: String, required: true },
    geometry: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ price: 1 });
listingSchema.index({ category: 1 });

module.exports = mongoose.model("Listing", listingSchema);
module.exports.CATEGORIES = CATEGORIES;
