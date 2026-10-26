import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getError } from "../api/axios";
import { formatDate, formatPrice } from "../utils";
import ImageWithFallback from "../components/ImageWithFallback";

export default function HostDashboard() {
  const [listings, setListings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      // Dono API ek saath (parallel) -> page jaldi load hota hai
      const [l, b] = await Promise.all([api.get("/listings/mine"), api.get("/bookings/host")]);
      setListings(l.data.listings);
      setBookings(b.data.bookings);
      setStats(b.data.stats);
    } catch (err) {
      setError(getError(err));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/listings/${listing._id}`);
      setMessage("Listing deleted.");
      load();
    } catch (err) {
      setError(getError(err)); // e.g. upcoming confirmed bookings hain
    }
  };

  if (!listings && !error) return <p className="mt-10 text-center text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Host dashboard</h1>
        <Link to="/host/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">+ Add listing</Link>
      </div>

      {message && <p className="mb-4 rounded bg-green-50 p-3 text-green-700">{message}</p>}
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{error}</p>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="My listings" value={listings?.length ?? 0} />
        <Stat label="Confirmed bookings" value={stats.totalBookings} />
        <Stat label="Total revenue" value={formatPrice(stats.revenue)} />
      </div>

      {/* My listings */}
      <h2 className="mb-3 mt-8 text-xl font-semibold">My listings</h2>
      {listings?.length === 0 ? (
        <p className="text-gray-500">You have no listings yet. Click "Add listing" to create one.</p>
      ) : (
        <div className="space-y-3">
          {listings?.map((l) => (
            <div key={l._id} className="flex items-center gap-4 rounded-2xl border bg-white p-3">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                <ImageWithFallback
                  src={l.image?.url}
                  alt={l.title}
                  className="h-20 w-28 object-cover"
                  width={300}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/listings/${l._id}`} className="block truncate font-semibold hover:underline">{l.title}</Link>
                <p className="text-sm text-gray-500">{l.location}, {l.country} · {formatPrice(l.price)}/night</p>
                {l.reviewCount > 0 && <p className="text-sm">★ {l.avgRating} ({l.reviewCount})</p>}
              </div>
              <div className="flex shrink-0 gap-4 text-sm font-semibold">
                <Link to={`/host/${l._id}/edit`} className="text-brand">Edit</Link>
                <button onClick={() => handleDelete(l)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guests */}
      <h2 className="mb-3 mt-8 text-xl font-semibold">Bookings on my listings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No confirmed bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Listing</th><th className="p-3">Guest</th><th className="p-3">Contact</th>
                <th className="p-3">Dates</th><th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b last:border-0">
                  <td className="p-3">{b.listing?.title}</td>
                  <td className="p-3">{b.guest?.username} ({b.guests})</td>
                  <td className="p-3">📞 {b.guest?.phone}<br /><span className="text-gray-500">{b.guest?.email}</span></td>
                  <td className="p-3 whitespace-nowrap">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                  <td className="p-3 font-semibold">{formatPrice(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
