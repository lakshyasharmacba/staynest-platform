require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const ExpressError = require("./utils/ExpressError");
const Booking = require("./models/Booking");
const payments = require("./controllers/payments");

// Zaroori env variables nahi hue to server start hi nahi hoga (silent bug se better)
["JWT_SECRET", "OTP_SECRET", "EMAIL_USER", "EMAIL_PASS", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].forEach((k) => {
  if (!process.env[k]) {
    console.error(`Missing env variable: ${k} (copy .env.example to .env)`);
    process.exit(1);
  }
});

const app = express();
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1); // Render/Heroku ke peeche sahi IP

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

// Webhook ko RAW body chahiye (signature verify ke liye) -> express.json() se PEHLE
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), payments.webhook);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api", require("./routes/reviews"));
app.use("/api", require("./routes/bookings"));

app.use((req, res, next) => next(new ExpressError(404, "Route not found")));

// Ek jagah error handling (Express 5 async errors apne aap yahan pahunchte hain)
app.use((err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;

  if (err.name === "CastError") { status = 400; message = "Invalid id"; }
  else if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyPattern || {})[0] || "Value"} already exists`; }
  else if (err.name === "MulterError") { status = 400; }
  else if (status === 500) { console.error(err); message = "Something went wrong. Please try again later."; }

  res.status(status).json({ message });
});

const port = process.env.PORT || 8080;
const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to DB");
    app.listen(port, () => console.log(`Server running on port ${port}`));
    // Har 5 min: payment na karne wali pending bookings ko 'expired' (dates free ho jati hain)
    setInterval(
      () => Booking.updateMany({ status: "pending", holdExpiresAt: { $lt: new Date() } }, { status: "expired" }).catch(() => {}),
      5 * 60 * 1000
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
