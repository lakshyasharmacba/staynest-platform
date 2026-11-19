import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { formatDate, formatPrice } from "../utils";
import ImageWithFallback from "../components/ImageWithFallback";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [l, b] = await Promise.all([
        api.get("/listings/mine"),
        api.get("/bookings/host"),
      ]);
      setListings(l.data.listings);
      setBookings(b.data.bookings);
      setStats(b.data.stats);
    } catch (err) {
      setError(getError(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Edit – upcoming confirmed booking ho to error, form open nahi
  const handleEdit = (listing) => {
    setError("");
    setMessage("");

    const hasUpcoming = bookings.some((b) => {
      const listingId = b.listing?._id || b.listing;
      return (
        String(listingId) === String(listing._id) &&
        new Date(b.checkOut) > new Date()
      );
    });

    if (hasUpcoming) {
      setError("Cannot update: this listing has upcoming confirmed bookings");
      return;
    }

    navigate(`/host/${listing._id}/edit`);
  };

  // Delete – no popup, seedha API
  const handleDelete = async (listing) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/listings/${listing._id}`);
      setMessage("Listing deleted.");
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  if (!listings && !error) {
    return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  }

  // Empty state – Become a host
  if (listings && listings.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
          🏠
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Have a place to share? Become a host
        </h1>
        <p className="mx-auto mt-3 max-w-md text-gray-600">
          You have not listed any property yet. Add your first listing to start
          receiving bookings. Your bookings, saved stays and profile stay
          available as usual.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/host/new"
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            List your property
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
          >
            Explore stays
          </Link>
        </div>
        <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
          {[
            {
              num: "1",
              title: "Add your place",
              desc: "Upload a photo, set your price and describe your stay.",
            },
            {
              num: "2",
              title: "Guests book and pay",
              desc: "Guests choose their dates and pay securely online.",
            },
            {
              num: "3",
              title: "Welcome your guests",
              desc: "After a booking is confirmed you see the guest's contact details here.",
            },
          ].map((s) => (
            <div key={s.num} className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {s.num}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Host dashboard</h1>
        <Link
          to="/host/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          + Add listing
        </Link>
      </div>

      {message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-green-700">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{error}</p>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="My listings" value={listings?.length ?? 0} />
        <Stat label="Confirmed bookings" value={stats.totalBookings} />
        <Stat label="Total revenue" value={formatPrice(stats.revenue)} />
      </div>

      {/* My listings */}
      <h2 className="mb-3 mt-8 text-xl font-semibold">My listings</h2>
      <div className="space-y-3">
        {listings?.map((l) => (
          <div
            key={l._id}
            className="flex items-center gap-4 rounded-2xl border bg-white p-3"
          >
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
              <ImageWithFallback
                src={l.image?.url}
                alt={l.title}
                className="h-20 w-28 object-cover"
                width={300}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/listings/${l._id}`}
                className="block truncate font-semibold hover:underline"
              >
                {l.title}
              </Link>
              <p className="text-sm text-gray-500">
                {l.location}, {l.country} · {formatPrice(l.price)}/night
              </p>
              {l.reviewCount > 0 && (
                <p className="text-sm">
                  ★ {l.avgRating} ({l.reviewCount})
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-4 text-sm font-semibold">
              <button onClick={() => handleEdit(l)} className="text-brand">
                Edit
              </button>
              <button onClick={() => handleDelete(l)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings on my listings */}
      <h2 className="mb-3 mt-8 text-xl font-semibold">Bookings on my listings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No confirmed bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Listing</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b last:border-0">
                  <td className="p-3">{b.listing?.title}</td>
                  <td className="p-3">
                    {b.guest?.username} ({b.guests})
                  </td>
                  <td className="p-3">
                    📞 {b.guest?.phone}
                    <br />
                    <span className="text-gray-500">{b.guest?.email}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                  </td>
                  <td className="p-3 font-semibold">
                    {formatPrice(b.totalAmount)}
                  </td>
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