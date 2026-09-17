const Listing = require("../models/listing.js");
const axios = require("axios");
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const rawSearch = typeof req.query.search === "string" ? req.query.search : "";
  const search = rawSearch.trim().toLowerCase();

  let filter = {};

  if (search) {
    const categoryKeywords = {
      rooms: "room|cottage|loft|cabin|chalet|house|villa|haveli",
      city: "city|downtown|canal|heritage|skyline",
      mountain: "mountain|alps|ski|aspen|verbier",
      villa: "villa|haveli",
      beach: "beach|ocean|coast|maldives|goa|cancun",
      cabin: "cabin|chalet|treehouse",
      lake: "lake|lakefront",
      farmstay: "farm|rural|retreat|lodge",
      tropical: "tropical|rainforest|maldives|goa"
    };

    const searchValue = categoryKeywords[search] || search;
    const safeSearch = categoryKeywords[search]
      ? searchValue
      : searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(safeSearch, "i");

    filter = {
      $or: [
        { title: regex },
        { location: regex },
        { country: regex },
        { description: regex }
      ]
    };
  }

  const allListing = await Listing.find(filter).sort({ _id: -1 });
  res.render("listings/index", { allListing, search });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/");
  }

  const relatedListings = await Listing.find({ _id: { $ne: listing._id } })
    .sort({ _id: -1 })
    .limit(3);

  res.render("listings/show", { listing, relatedListings });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  
  // Default coordinates fallback
  newListing.geometry = {
    type: "Point",
    coordinates: [77.2090, 28.6139]
  };

  try {
    const location = `${req.body.listing.location}, ${req.body.listing.country}`;
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await axios.get(geoUrl, {
      headers: {
        "User-Agent": "wanderlust-app"
      },
      timeout: 3000
    });

    if (response.data && response.data.length > 0) {
      const lat = Number(response.data[0].lat);
      const lon = Number(response.data[0].lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        newListing.geometry = {
          type: "Point",
          coordinates: [lon, lat]
        };
      }
    }
  } catch (err) {
    console.log("Geocoding failed, using fallback coordinates:", err.message);
  }

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  } else {
    newListing.image = {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      filename: "default-image"
    };
  }

  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/");
  }
  let originalImageUrl = "";
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  }
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/");
  }

  // Check if location changed
  if (req.body.listing && req.body.listing.location && listing.location !== req.body.listing.location) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(req.body.listing.location)}&format=json&limit=1`;
      const response = await axios.get(geoUrl, {
        headers: {
          "User-Agent": "wanderlust-app",
        },
        timeout: 3000
      });
      if (response.data && response.data.length > 0) {
        const lat = Number(response.data[0].lat);
        const lon = Number(response.data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          req.body.listing.geometry = {
            type: "Point",
            coordinates: [lon, lat],
          };
        }
      }
    } catch (err) {
      console.log("Geocoding update failed:", err.message);
    }
  }

  let updatedListing = await Listing.findByIdAndUpdate(
    id,
    req.body.listing,
    { new: true }
  );

  // Check if Image Update
  if (req.file) {
    if (updatedListing.image && updatedListing.image.filename && updatedListing.image.filename !== "default-image") {
      try {
        await cloudinary.uploader.destroy(updatedListing.image.filename);
      } catch (err) {
        console.log("Cloudinary image delete error:", err.message);
      }
    }
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await updatedListing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect('/');
};
