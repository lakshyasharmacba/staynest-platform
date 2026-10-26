import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { addDays, formatPrice, loadRazorpay, nightsBetween, todayStr } from "../utils";

export default function BookingBox({ listing, isOwner }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights > 0 ? nights * listing.price : 0; // sirf dikhane ke liye, asli amount server calculate karta hai

  const handleCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) setCheckOut(""); // checkout checkin ke baad hi hona chahiye
  };

  const handleReserve = async () => {
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    setError("");
    if (!user.phone) return setError("A mobile number is required to book. Add it in your Profile (click your name at the top).");
    if (nights < 1) return setError("Please select check-in and check-out dates");

    setLoading(true);
    try {
      // 1) Server booking + Razorpay order banata hai (dates 15 min hold)
      const { data } = await api.post(`/listings/${listing._id}/bookings`, { checkIn, checkOut, guests });

      // 2) Razorpay popup
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load Razorpay. Check your internet connection.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "Wanderlust",
        description: listing.title,
        prefill: data.prefill, // name, email, mobile number
        theme: { color: "#fe424d" },
        // 3) Payment success -> server signature verify karega, tab booking confirm hogi
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            navigate("/bookings", { state: { justBooked: true } });
          } catch (err) {
            setError(getError(err));
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Your dates are held for 15 minutes.");
            setLoading(false);
          },
        },
      });
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response ? getError(err) : err.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-fit rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xl font-bold">{formatPrice(listing.price)} <span className="text-sm font-normal">/ night</span></p>

      {isOwner ? (
        <div className="mt-2 text-sm text-gray-500">
          <p>This is your listing.</p>
          <Link to={`/host/${listing._id}/edit`} className="mt-2 inline-block font-semibold text-brand">Edit listing</Link>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-500">Check-in
              <input type="date" className="input mt-1" min={todayStr()} value={checkIn} onChange={(e) => handleCheckIn(e.target.value)} />
            </label>
            <label className="text-xs text-gray-500">Check-out
              <input type="date" className="input mt-1" min={checkIn ? addDays(checkIn, 1) : todayStr()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </label>
          </div>

          <label className="block text-xs text-gray-500">Guests
            <select className="input mt-1" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </label>

          {nights > 0 && (
            <div className="flex justify-between border-t pt-3 text-sm">
              <span>{formatPrice(listing.price)} x {nights} night{nights > 1 ? "s" : ""}</span>
              <b>{formatPrice(total)}</b>
            </div>
          )}

          {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <button className="btn" onClick={handleReserve} disabled={loading}>
            {loading ? "Please wait..." : user ? "Reserve & Pay" : "Login to reserve"}
          </button>
          <p className="text-center text-xs text-gray-500">Test mode: use card 4111 1111 1111 1111</p>
        </div>
      )}
    </div>
  );
}
