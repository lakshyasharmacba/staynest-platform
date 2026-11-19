import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import AuthModal from "./AuthModal";

export default function HeartButton({ listingId }) {
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const [showModal, setShowModal] = useState(false);
  const saved = ids.has(listingId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowModal(true);          // beautiful popup
      return;
    }
    toggle(listingId);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow transition hover:scale-110"
      >
        <span className={saved ? "text-brand" : "text-gray-400"}>
          {saved ? "♥" : "♡"}
        </span>
      </button>

      <AuthModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Save this stay to your wishlist"
      />
    </>
  );
}