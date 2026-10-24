import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useWishlist } from "../context/WishlistContext";
import ListingCard from "../components/ListingCard";

export default function Wishlist() {
  const { ids } = useWishlist();
  const [listings, setListings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/wishlist").then((res) => setListings(res.data.listings)).catch((err) => setError(getError(err)));
  }, []);

  if (error) return <p className="mx-auto mt-10 max-w-xl rounded bg-red-50 p-3 text-red-600">{error}</p>;
  if (!listings) return <p className="mt-10 text-center text-gray-500">Loading...</p>;

  // Heart hatane pe card turant list se gayab (ids context se)
  const shown = listings.filter((l) => ids.has(l._id));

  return (
    <div className="mx-auto max-w-6xl py-6">
      <h1 className="mb-4 text-2xl font-bold">Saved places</h1>
      {shown.length === 0 ? (
        <p className="text-gray-500">Nothing saved yet. <Link to="/" className="text-brand">Explore places</Link></p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
