const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const ExpressError = require("../utils/ExpressError");
const getRazorpay = require("../utils/razorpay");
const { sendBookingCancelledEmails } = require("../utils/bookingEmail");

const DAY = 24 * 60 * 60 * 1000;
const HOLD_MS = 15 * 60 * 1000; // payment ke liye 15 min
const toUtcDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

module.exports.create = async (req, res) => {
  const { listingId } = req.params;
  const checkIn = toUtcDay(req.body.checkIn);
  const checkOut = toUtcDay(req.body.checkOut);
  const { guests } = req.body;

  if (checkIn < toUtcDay(new Date())) throw new ExpressError(400, "Check-in date cannot be in the past");
  if (checkOut <= checkIn) throw new ExpressError(400, "Check-out must be after check-in");
  const nights = Math.round((checkOut - checkIn) / DAY);
  if (nights > 30) throw new ExpressError(400, "Maximum stay is 30 nights");

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ExpressError(404, "Listing not found");
  if (listing.owner.equals(req.user._id)) throw new ExpressError(400, "You cannot book your own listing");
  if (guests > listing.maxGuests) throw new ExpressError(400, `This place allows maximum ${listing.maxGuests} guests`);

  // DOUBLE BOOKING CHECK: do date ranges overlap  <=>  newIn < oldOut  AND  newOut > oldIn
  const clash = await Booking.exists({
    listing: listing._id,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    $or: [{ status: "confirmed" }, { status: "pending", holdExpiresAt: { $gt: new Date() } }],
  });
  if (clash) throw new ExpressError(409, "These dates are not available");

  const totalAmount = nights * listing.price; // amount hamesha server calculate karta hai
  if (totalAmount < 1) throw new ExpressError(400, "Invalid booking amount");

  const booking = await Booking.create({
    listing: listing._id,
    guest: req.user._id,
    checkIn,
    checkOut,
    guests,
    nights,
    totalAmount,
    holdExpiresAt: new Date(Date.now() + HOLD_MS),
  });

  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100), // paise me
      currency: "INR",
      receipt: booking.id,
      notes: { bookingId: booking.id },
    });
  } catch (err) {
    console.log("Razorpay order failed:", err.message || err);
    await booking.deleteOne();
    throw new ExpressError(502, "Payment service unavailable. Please try again.");
  }

  booking.payment.orderId = order.id;
  await booking.save();

  res.status(201).json({
    booking,
    order: { id: order.id, amount: order.amount, currency: order.currency },
    keyId: process.env.RAZORPAY_KEY_ID,
    prefill: { name: req.user.username, email: req.user.email, contact: req.user.phone },
  });
};

// Host ka phone sirf CONFIRMED booking me dikhta hai
const hideHostPhone = (booking) => {
  const obj = booking.toObject();
  if (obj.status !== "confirmed" && obj.listing && obj.listing.owner) delete obj.listing.owner.phone;
  return obj;
};

module.exports.mine = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate({
      path: "listing",
      select: "title image location country owner",
      populate: { path: "owner", select: "username phone" },
    })
    .sort("-createdAt");
  res.json({ bookings: bookings.map(hideHostPhone) });
};

module.exports.host = async (req, res) => {
  const listingIds = await Listing.find({ owner: req.user._id }).distinct("_id");
  const bookings = await Booking.find({ listing: { $in: listingIds }, status: "confirmed" })
    .populate("listing", "title location")
    .populate("guest", "username phone email") // confirmed booking ke baad guest ka contact host ko
    .sort("-createdAt");

  const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  res.json({ bookings, stats: { totalBookings: bookings.length, revenue } });
};

module.exports.cancel = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id });
  if (!booking) throw new ExpressError(404, "Booking not found");
  if (!["pending", "confirmed"].includes(booking.status)) throw new ExpressError(400, "This booking cannot be cancelled");
  if (booking.checkIn <= new Date()) throw new ExpressError(400, "Cannot cancel after check-in date");

  let refundAmount = 0;
  if (booking.status === "confirmed") {
    // Policy: check-in se 2+ din pehle = full refund, warna refund nahi
    const daysLeft = (booking.checkIn - new Date()) / DAY;
    refundAmount = daysLeft >= 2 ? booking.totalAmount : 0;

    if (refundAmount > 0 && booking.payment.paymentId) {
      try {
        const refund = await getRazorpay().payments.refund(booking.payment.paymentId, {
          amount: Math.round(refundAmount * 100),
        });
        booking.payment.refundId = refund.id;
        booking.payment.refundAmount = refundAmount;
      } catch (err) {
        console.log("Refund failed:", err.message || err);
        throw new ExpressError(502, "Refund failed. Please try again.");
      }
    }
  }
  const wasConfirmed = booking.status === "confirmed";
  booking.status = "cancelled";
  await booking.save();

  if (wasConfirmed) {
    sendBookingCancelledEmails(booking._id, refundAmount).catch(() => {});
  }

  res.json({ booking, refundAmount });
};
