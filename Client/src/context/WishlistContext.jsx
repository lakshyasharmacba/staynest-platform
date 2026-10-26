import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "./../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set()); // saved listings ke ids
  const pending = useRef(new Set()); // jis listing ki request chal rahi hai, us par double click ignore

  // Login hone pe wishlist load, logout pe khali
  useEffect(() => {
    if (!user) return setIds(new Set());
    api.get("/wishlist").then((res) => setIds(new Set(res.data.listings.map((l) => l._id)))).catch(() => {});
  }, [user]);

  // Optimistic update: heart turant badal jata hai, API fail ho to wapas purani state
  const toggle = async (listingId) => {
    if (pending.current.has(listingId)) return;
    pending.current.add(listingId);

    const saved = ids.has(listingId);
    const next = new Set(ids);
    saved ? next.delete(listingId) : next.add(listingId);
    setIds(next);
    try {
      if (saved) await api.delete(`/wishlist/${listingId}`);
      else await api.post(`/wishlist/${listingId}`);
      // id same rakhi hai, taaki baar baar click par toast jama na hon
      if (saved) toast("Removed from your wishlist", { id: "wishlist" });
      else toast.success("Added to your wishlist", { id: "wishlist" });
    } catch {
      setIds(ids);
      toast.error("Could not update your wishlist. Please try again.", { id: "wishlist" });
    } finally {
      pending.current.delete(listingId);
    }
  };

  return <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);