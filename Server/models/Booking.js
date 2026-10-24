const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // INR
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },
    holdExpiresAt: Date, // pending booking 15 min dates hold karti hai
    payment: {
      orderId: String,
      paymentId: String,
      refundId: String,
      refundAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ "payment.orderId": 1 });

module.exports = mongoose.model("Booking", bookingSchema);
