require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const initData = require("./data.js");
const Listing = require("../models/Listing");
const User = require("../models/User");

// [lng, lat]
const COORDS = {
  Malibu: [-118.78, 34.03], "New York City": [-74.006, 40.7128], Aspen: [-106.82, 39.19],
  Florence: [11.2558, 43.7696], Portland: [-122.6765, 45.5231], Cancun: [-86.8515, 21.1619],
  "Lake Tahoe": [-120.0324, 39.0968], "Los Angeles": [-118.2437, 34.0522], Verbier: [7.2284, 46.0963],
  "Serengeti National Park": [34.8333, -2.3333], Amsterdam: [4.9041, 52.3676], "Baa Atoll": [73.0, 5.2],
  Jaipur: [75.7873, 26.9124], Goa: [74.124, 15.2993],
};

(async () => {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust");

  // Seed host user (verified), listings iske naam pe banengi
  let host = await User.findOne({ email: "host@wanderlust.local" });
  if (!host) {
    host = await User.create({
      username: "demo_host",
      email: "host@wanderlust.local",
      phone: "9876543210",
      password: await bcrypt.hash("Host12345", 10),
      isVerified: true,
      role: "user",
    });
  }

  // Seed admin user (verified, role = admin)
  let admin = await User.findOne({ email: "admin@wanderlust.local" });
  if (!admin) {
    admin = await User.create({
      username: "demo_admin",
      email: "admin@wanderlust.local",
      phone: "9123456780",
      password: await bcrypt.hash("Admin12345", 10),
      isVerified: true,
      role: "admin",
    });
  }

  await Listing.deleteMany({});
  const docs = initData.data.map((l) => ({
    ...l,
    owner: host._id,
    maxGuests: 4,
    geometry: { type: "Point", coordinates: COORDS[l.location] || [77.209, 28.6139] },
  }));
  await Listing.insertMany(docs);
  console.log(`Seeded ${docs.length} listings (host: host@wanderlust.local / Host12345)`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
