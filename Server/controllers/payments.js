const crypto = require("crypto");
const Booking = require("../models/Booking");
const ExpressError = require("../utils/ExpressError");
const getRazorpay = require("../utils/razorpay");
const { safeEqual } = require("../utils/otp");
const { sendBookingConfirmedEmails } = require("../utils/bookingEmail");

const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");

// Booking ko confirm karta hai. verify API aur webhook dono yahi use karte hain (idempotent: dobara chale to koi problem nahi)
async function confirmBooking(booking, paymentId) {
  if (booking.status === "confirmed") return booking;

  // Hold expire hone ke baad kisi aur ne dates le li ho to? Paisa wapas.
  const clash = await Booking.exists({
    _id: { $ne: booking._id },
    listing: booking.listing,
    status: "confirmed",
    checkIn: { $lt: booking.checkOut },
    checkOut: { $gt: booking.checkIn },
  });
  if (clash) {
    try {
      const refund = await getRazorpay().payments.refund(paymentId, {
        amount: Math.round(booking.totalAmount * 100),
      });
      booking.payment.refundId = refund.id;
      booking.payment.refundAmount = booking.totalAmount;
    } catch (err) {
      console.log("Auto-refund failed:", err.message);
    }
    booking.payment.paymentId = paymentId;
    booking.status = "cancelled";
    await booking.save();
    throw new ExpressError(409, "These dates were just booked by someone else. Your payment will be refunded.");
  }

  // Atomic update: sirf pending/expired se confirmed (verify + webhook ek saath aaye to bhi ek hi baar)
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: { $in: ["pending", "expired"] } },
    { status: "confirmed", "payment.paymentId": paymentId, $unset: { holdExpiresAt: 1 } },
    { new: true }
  );

  if (updated) {
    sendBookingConfirmedEmails(updated._id).catch(() => {});
  }

  return updated || (await Booking.findById(booking._id));
}

// Frontend: Razorpay popup success ke baad ye call hota hai
module.exports.verify = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const booking = await Booking.findOne({ "payment.orderId": razorpay_order_id, guest: req.user._id });
  if (!booking) throw new ExpressError(404, "Booking not found");
  if (booking.status === "confirmed") return res.json({ booking });

  const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  if (!safeEqual(expected, razorpay_signature)) throw new ExpressError(400, "Payment verification failed");

  const confirmed = await confirmBooking(booking, razorpay_payment_id);
  res.json({ booking: confirmed });
};

// Razorpay server -> hamara server (backup: user tab band kar de tab bhi booking confirm). RAW body chahiye.
module.exports.webhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ message: "Webhook not configured" });

  const signature = req.headers["x-razorpay-signature"];
  if (!signature || !safeEqual(hmac(secret, req.body), signature)) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = JSON.parse(req.body.toString());
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload.payment.entity;
    const booking = await Booking.findOne({ "payment.orderId": payment.order_id });
    if (booking) {
      try {
        await confirmBooking(booking, payment.id);
      } catch (err) {
        console.log("Webhook confirm issue:", err.message);
      }
    }
  }
  res.json({ received: true });
};

module.exports.confirmBooking = confirmBooking;
