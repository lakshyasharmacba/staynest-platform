import { Link } from "react-router-dom";
import { formatPrice } from "../utils";
import HeartButton from "./HeartButton";
import ImageWithFallback from "./ImageWithFallback";

export default function ListingCard({ listing }) {
  return (
    <div className="relative">
      <Link to={`/listings/${listing._id}`} className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
        <ImageWithFallback
          src={listing.image?.url}
          alt={listing.title}
          className="h-48 w-full object-cover"
          width={600}
        />
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">{listing.title}</h3>
            {listing.reviewCount > 0 && <span className="shrink-0 text-sm">★ {listing.avgRating}</span>}
          </div>
          <p className="truncate text-sm text-gray-500">{listing.location}, {listing.country}</p>
          <p className="mt-1 text-sm"><b>{formatPrice(listing.price)}</b> / night</p>
        </div>
      </Link>
      <HeartButton listingId={listing._id} />
    </div>
  );
}
