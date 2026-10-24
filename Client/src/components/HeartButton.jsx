import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function HeartButton({ listingId }) {
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const navigate = useNavigate();
  const saved = ids.has(listingId);

  const handleClick = (e) => {
    e.preventDefault(); // card ek Link hai, heart pe click se page nahi khulna chahiye
    e.stopPropagation();
    if (!user) return navigate("/login");
    toggle(listingId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow"
    >
      <span className={saved ? "text-brand" : "text-gray-400"}>{saved ? "♥" : "♡"}</span>
    </button>
  );
}
