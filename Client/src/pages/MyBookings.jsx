import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getError } from "../api/axios";
import { formatDate, formatPrice } from "../utils";
import ImageWithFallback from "../components/ImageWithFallback";

const BADGE = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-200 text-gray-600",
  expired: "bg-gray-200 text-gray-600",
};

export default function MyBookings() {
  const { state } = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    state?.justBooked ? "Payment successful! Your booking is confirmed." : ""
  );

  const load = useCallback(() => {
    api
      .get("/bookings/mine")
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => setError(getError(err)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (b) => {
    const daysLeft = (new Date(b.checkIn) - new Date()) / (24 * 60 * 60 * 1000);
    const policy =
      b.status === "pending"
        ? "No payment was taken for this booking."
        : daysLeft >= 2
          ? `You will get a full refund of ${formatPrice(b.totalAmount)}.`
          : "Check-in is within 2 days, so no refund will be given.";
    if (!window.confirm(`Cancel this booking?\n\n${policy}`)) return;

    setError("");
    setMessage("");
    try {
      const { data } = await api.patch(`/bookings/${b._id}/cancel`, {});
      setMessage(
        data.refundAmount > 0
          ? `Booking cancelled. Refund of ${formatPrice(data.refundAmount)} initiated.`
          : "Booking cancelled."
      );
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm("Remove this booking from your list?")) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/bookings/${b._id}`);
      setMessage("Booking removed.");
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleClearCancelled = async () => {
    const count =
      bookings?.filter((b) => ["cancelled", "expired"].includes(b.status)).length || 0;
    if (count === 0) return;
    if (!window.confirm(`Remove all ${count} cancelled/expired booking(s)?`)) return;

    setError("");
    setMessage("");
    try {
      const { data } = await api.delete("/bookings/clear-cancelled");
      setMessage(`${data.deleted} booking(s) removed.`);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  if (!bookings && !error) {
    return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  }

  const cancelledCount =
    bookings?.filter((b) => ["cancelled", "expired"].includes(b.status)).length || 0;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My bookings</h1>

        {cancelledCount > 0 && (
          <button
            onClick={handleClearCancelled}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear all cancelled ({cancelledCount})
          </button>
        )}
      </div>

      {message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-green-700">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{error}</p>
      )}

      {bookings?.length === 0 && (
        <p className="text-gray-500">
          No bookings yet.{" "}
          <Link to="/" className="text-brand">
            Explore places
          </Link>
        </p>
      )}

      <div className="space-y-4">
        {bookings?.map((b) => {
          const upcoming = new Date(b.checkIn) > new Date();
          const completed =
            b.status === "confirmed" && new Date(b.checkOut) < new Date();
          const host = b.listing?.owner;
          const canDelete = ["cancelled", "expired"].includes(b.status);

          const coords = b.listing?.geometry?.coordinates;
          const hasLocation =
            b.status === "confirmed" &&
            Array.isArray(coords) &&
            coords.length === 2;

          return (
            <div
              key={b._id}
              className="flex gap-4 rounded-2xl border bg-white p-3"
            >
              <div className="h-28 w-32 shrink-0 overflow-hidden rounded-xl">
                <ImageWithFallback
                  src={b.listing?.image?.url}
                  alt={b.listing?.title || "Listing"}
                  className="h-28 w-32 object-cover"
                  width={300}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/listings/${b.listing?._id}`}
                    className="truncate font-semibold hover:underline"
                  >
                    {b.listing?.title}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${BADGE[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {b.listing?.location}, {b.listing?.country}
                </p>
                <p className="mt-1 text-sm">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ·{" "}
                  {b.nights} night{b.nights > 1 ? "s" : ""} · {b.guests} guest
                  {b.guests > 1 ? "s" : ""}
                </p>
                <p className="text-sm">
                  <b>{formatPrice(b.totalAmount)}</b>
                  {b.payment?.refundAmount > 0 && (
                    <span className="text-green-700">
                      {" "}
                      · Refunded {formatPrice(b.payment.refundAmount)}
                    </span>
                  )}
                </p>

                {b.status === "confirmed" && host?.phone && (
                  <p className="mt-1 text-sm text-gray-600">
                    Host: {host.username} · 📞 {host.phone}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  {["pending", "confirmed"].includes(b.status) && upcoming && (
                    <button
                      onClick={() => handleCancel(b)}
                      className="font-semibold text-red-600"
                    >
                      Cancel booking
                    </button>
                  )}

                  {hasLocation && (
                    <Link
                      to={`/bookings/${b._id}/location`}
                      className="font-semibold text-brand"
                    >
                      View location
                    </Link>
                  )}

                  {completed && (
                    <Link
                      to={`/listings/${b.listing?._id}`}
                      className="font-semibold text-brand"
                    >
                      Write a review
                    </Link>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(b)}
                      className="font-semibold text-gray-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}