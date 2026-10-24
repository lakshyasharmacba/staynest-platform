const Booking = require("../models/Booking");
const { getTransporter } = require("./sendEmail");
const escapeHtml = require("./escapeHtml");

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Booking Confirm hone par Guest aur Host dono ko receipt bhejta hai
async function sendBookingConfirmedEmails(bookingId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("guest", "username email phone")
      .populate({
        path: "listing",
        select: "title location country owner",
        populate: { path: "owner", select: "username email phone" },
      });

    if (!booking || !booking.guest || !booking.listing || !booking.listing.owner) return;

    const guest = booking.guest;
    const listing = booking.listing;
    const host = listing.owner;
    const transporter = getTransporter();

    const titleSafe = escapeHtml(listing.title);
    const locationSafe = escapeHtml(`${listing.location}, ${listing.country}`);
    const hostNameSafe = escapeHtml(host.username);
    const guestNameSafe = escapeHtml(guest.username);
    const inDate = formatDate(booking.checkIn);
    const outDate = formatDate(booking.checkOut);

    // 1. Guest Receipt Email
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: `Booking Confirmed: ${listing.title} - Wanderlust`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h2 style="color:#fe424d;margin-top:0">Booking Confirmed!</h2>
          <p>Hi <b>${guestNameSafe}</b>, your reservation is confirmed.</p>
          <div style="background:#f9fafb;padding:12px 16px;border-radius:6px;margin:16px 0">
            <p style="margin:4px 0"><b>Listing:</b> ${titleSafe}</p>
            <p style="margin:4px 0"><b>Location:</b> ${locationSafe}</p>
            <p style="margin:4px 0"><b>Dates:</b> ${inDate} to ${outDate} (${booking.nights} night${booking.nights > 1 ? "s" : ""})</p>
            <p style="margin:4px 0"><b>Guests:</b> ${booking.guests}</p>
            <p style="margin:4px 0"><b>Amount Paid:</b> ₹${booking.totalAmount.toLocaleString("en-IN")}</p>
            <p style="margin:4px 0"><b>Booking ID:</b> ${booking._id}</p>
          </div>
          <div style="margin:16px 0">
            <h4 style="margin-bottom:6px">Host Contact Details:</h4>
            <p style="margin:2px 0"><b>Host:</b> ${hostNameSafe}</p>
            <p style="margin:2px 0"><b>Phone:</b> ${host.phone}</p>
            <p style="margin:2px 0"><b>Email:</b> ${host.email}</p>
          </div>
          <p style="font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px">
            * Cancellation policy: Full refund if cancelled 2 or more days prior to check-in.
          </p>
        </div>
      `,
    });

    // 2. Host Notification Email
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
      to: host.email,
      subject: `New Booking Confirmed: ${listing.title} - Wanderlust`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h2 style="color:#fe424d;margin-top:0">You Have a New Booking!</h2>
          <p>Hi <b>${hostNameSafe}</b>, a new reservation has been made on your listing.</p>
          <div style="background:#f9fafb;padding:12px 16px;border-radius:6px;margin:16px 0">
            <p style="margin:4px 0"><b>Listing:</b> ${titleSafe}</p>
            <p style="margin:4px 0"><b>Dates:</b> ${inDate} to ${outDate} (${booking.nights} night${booking.nights > 1 ? "s" : ""})</p>
            <p style="margin:4px 0"><b>Guests:</b> ${booking.guests}</p>
            <p style="margin:4px 0"><b>Payout Amount:</b> ₹${booking.totalAmount.toLocaleString("en-IN")}</p>
            <p style="margin:4px 0"><b>Booking ID:</b> ${booking._id}</p>
          </div>
          <div style="margin:16px 0">
            <h4 style="margin-bottom:6px">Guest Contact Details:</h4>
            <p style="margin:2px 0"><b>Guest:</b> ${guestNameSafe}</p>
            <p style="margin:2px 0"><b>Phone:</b> ${guest.phone}</p>
            <p style="margin:2px 0"><b>Email:</b> ${guest.email}</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send booking confirmed email:", err.message);
  }
}

// Booking Cancel hone par Guest aur Host dono ko notification bhejta hai
async function sendBookingCancelledEmails(bookingId, refundAmount = 0) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("guest", "username email phone")
      .populate({
        path: "listing",
        select: "title location country owner",
        populate: { path: "owner", select: "username email phone" },
      });

    if (!booking || !booking.guest || !booking.listing || !booking.listing.owner) return;

    const guest = booking.guest;
    const listing = booking.listing;
    const host = listing.owner;
    const transporter = getTransporter();

    const titleSafe = escapeHtml(listing.title);
    const guestNameSafe = escapeHtml(guest.username);
    const hostNameSafe = escapeHtml(host.username);
    const inDate = formatDate(booking.checkIn);
    const outDate = formatDate(booking.checkOut);

    const refundText =
      refundAmount > 0
        ? `Refund of ₹${refundAmount.toLocaleString("en-IN")} has been initiated to your original payment method.`
        : `No refund was applicable per policy (cancelled less than 2 days before check-in).`;

    // 1. Guest Cancellation Email
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: `Booking Cancelled: ${listing.title} - Wanderlust`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h2 style="color:#dc2626;margin-top:0">Booking Cancelled</h2>
          <p>Hi <b>${guestNameSafe}</b>, your booking for <b>${titleSafe}</b> has been cancelled.</p>
          <div style="background:#f9fafb;padding:12px 16px;border-radius:6px;margin:16px 0">
            <p style="margin:4px 0"><b>Dates:</b> ${inDate} to ${outDate}</p>
            <p style="margin:4px 0"><b>Booking ID:</b> ${booking._id}</p>
            <p style="margin:4px 0"><b>Refund Status:</b> ${refundText}</p>
          </div>
        </div>
      `,
    });

    // 2. Host Cancellation Email
    await transporter.sendMail({
      from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
      to: host.email,
      subject: `Booking Cancelled: ${listing.title} - Wanderlust`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h2 style="color:#dc2626;margin-top:0">Reservation Cancelled</h2>
          <p>Hi <b>${hostNameSafe}</b>, reservation for <b>${titleSafe}</b> (${inDate} to ${outDate}) has been cancelled.</p>
          <p>These dates are now free on your calendar for new guests to book.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send booking cancelled email:", err.message);
  }
}

module.exports = {
  sendBookingConfirmedEmails,
  sendBookingCancelledEmails,
};
