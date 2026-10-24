require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust");
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }
  user.role = "admin";
  user.isVerified = true;
  await user.save();
  console.log(`Success: ${user.email} is now an admin!`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
