import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import ListingMap from "../components/ListingMap";
import BookingBox from "../components/BookingBox";
import ImageWithFallback from "../components/ImageWithFallback";
import { formatDate } from "../utils";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null); // { listing, reviews }
  const [error, setError] = useState("");

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    api.get(`/listings/${id}`).then((res) => setData(res.data)).catch((err) => setError(getError(err)));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setPosting(true);
    try {
      await api.post(`/listings/${id}/reviews`, { rating, comment });
      setComment("");
      setRating(5);
      load(); // naya review + updated average rating
    } catch (err) {
      setReviewError(getError(err)); // e.g. "You can review only after completing a stay here"
    } finally {
      setPosting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      load();
    } catch (err) {
      setReviewError(getError(err));
    }
  };

  if (error) return <p className="mx-auto mt-10 max-w-xl rounded bg-red-50 p-3 text-red-600">{error}</p>;
  if (!data) return <p className="mt-10 text-center text-gray-500">Loading...</p>;

  const { listing, reviews } = data;
  const isOwner = user && listing.owner?._id === user.id;

  return (
    <div className="mx-auto max-w-4xl py-6">
      <Link to="/" className="text-sm text-brand">← Back to listings</Link>
      <h1 className="mt-2 text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-500">
        {listing.location}, {listing.country}
        {listing.reviewCount > 0 && <> · ★ {listing.avgRating} ({listing.reviewCount} reviews)</>}
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <ImageWithFallback
          src={listing.image?.url}
          alt={listing.title}
          className="h-80 w-full object-cover"
          width={1200}
        />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Hosted by <b>{listing.owner?.username}</b> · up to {listing.maxGuests} guests · {listing.category}</p>
          <p className="mt-4 whitespace-pre-line">{listing.description}</p>
        </div>

        <BookingBox listing={listing} isOwner={isOwner} />
      </div>

      <h2 className="mb-3 mt-10 text-xl font-semibold">Where you'll be</h2>
      <ListingMap coordinates={listing.geometry.coordinates} />
      <p className="mt-1 text-xs text-gray-500">Exact address is shared after your booking is confirmed.</p>

      <h2 className="mb-3 mt-10 text-xl font-semibold">Reviews</h2>

      {user && !isOwner && (
        <form onSubmit={submitReview} className="mb-6 space-y-3 rounded-2xl border bg-white p-4">
          <StarRating value={rating} onChange={setRating} />
          <textarea className="input" rows={3} placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required minLength={3} />
          {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
          <button className="btn !w-auto px-6" disabled={posting}>{posting ? "Posting..." : "Post review"}</button>
        </form>
      )}
      {!user && <p className="mb-4 text-sm"><Link to="/login" state={{ from: `/listings/${id}` }} className="text-brand">Login</Link> to write a review.</p>}

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">@{r.author?.username}</p>
                <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
              </div>
              <StarRating value={r.rating} />
              <p className="mt-1">{r.comment}</p>
              {user && r.author?._id === user.id && (
                <button onClick={() => deleteReview(r._id)} className="mt-2 text-sm text-red-600">Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
