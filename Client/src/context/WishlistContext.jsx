import { createContext, useContext, useEffect, useState } from "react";
import api from "./../api/axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set()); // saved listings ke ids

  // Login hone pe wishlist load, logout pe khali
  useEffect(() => {
    if (!user) return setIds(new Set());
    api.get("/wishlist").then((res) => setIds(new Set(res.data.listings.map((l) => l._id)))).catch(() => {});
  }, [user]);

  // Optimistic update: heart turant badal jata hai, API fail ho to wapas purani state
  const toggle = async (listingId) => {
    const saved = ids.has(listingId);
    const next = new Set(ids);
    saved ? next.delete(listingId) : next.add(listingId);
    setIds(next);
    try {
      if (saved) await api.delete(`/wishlist/${listingId}`);
      else await api.post(`/wishlist/${listingId}`);
    } catch {
      setIds(ids);
    }
  };

  return <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
