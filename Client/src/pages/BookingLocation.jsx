import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getError } from "../api/axios";
import ListingMap from "../components/ListingMap";
import { formatDate } from "../utils";

export default function BookingLocation() {
  const { id } = useParams(); // booking id
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bookings/mine")
      .then((res) => {
        const b = res.data.bookings.find((x) => x._id === id);
        if (!b) setError("Booking not found");
        else if (b.status !== "confirmed") setError("Location is available only for confirmed bookings");
        else setBooking(b);
      })
      .catch((err) => setError(getError(err)));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/bookings" className="mt-4 inline-block text-brand">
          ← Back to My bookings
        </Link>
      </div>
    );
  }

  if (!booking) {
    return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  }

  const coords = booking.listing?.geometry?.coordinates; // [lng, lat]
  const [lng, lat] = coords || [];
  const title = booking.listing?.title;
  const place = `${booking.listing?.location || ""}, ${booking.listing?.country || ""}`;

  // Google Maps directions: current location → listing
  const directionsUrl =
    lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : null;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Link to="/bookings" className="text-sm font-medium text-brand hover:underline">
        ← Back to My bookings
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{place}</p>
      <p className="mt-1 text-sm text-gray-500">
        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
      </p>

      {coords ? (
        <div className="mt-6 space-y-4">
          <ListingMap coordinates={coords} />

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Get directions
            </a>
          )}
          <p className="text-xs text-gray-500">
            Opens Google Maps with directions from your current location to the stay.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-gray-500">Map location not available for this listing.</p>
      )}
    </div>
  );
}