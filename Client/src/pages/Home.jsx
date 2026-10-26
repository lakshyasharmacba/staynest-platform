import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getError } from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import FilterBar from "../components/FilterBar";
import ListingCard from "../components/ListingCard";
import ListingCardSkeleton from "../components/ListingCardSkeleton";
import Pagination from "../components/Pagination";

export default function Home() {
  // Filters URL me rehte hain (?category=Beach&page=2) -> refresh / back button / share sab kaam karta hai
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const debouncedSearch = useDebounce(search);

  const [data, setData] = useState({ listings: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0); // "Try again" dabane par +1 -> fetch dobara chalta hai

  const page = Number(params.get("page")) || 1;
  const category = params.get("category") || "";

  // Ek param change karo; filter badalne pe page 1 pe wapas
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const clearFilters = () => {
    setSearch("");
    setParams({});
  };

  // Debounced search ko URL me daalo
  useEffect(() => {
    if ((params.get("search") || "") !== debouncedSearch.trim()) setParam("search", debouncedSearch.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // URL badla (ya Try again dabaya) -> listings dobara fetch
  useEffect(() => {
    let ignore = false; // purani slow request ka result naye result ko overwrite na kare
    setLoading(true);
    setError("");
    api
      .get("/listings", { params: Object.fromEntries(params) })
      .then((res) => !ignore && setData(res.data))
      .catch((err) => !ignore && setError(getError(err)))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [params, retry]);

  // Skeleton tabhi dikhao jab loading 150ms se lambi ho (fast response pe flicker nahi hota)
  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const t = setTimeout(() => setShowSkeleton(true), 150);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div className="mx-auto max-w-6xl py-6">
      <FilterBar search={search} setSearch={setSearch} params={params} setParam={setParam} />

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">We couldn't load the stays</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setRetry((n) => n + 1)} className="btn mt-4 !w-auto px-6">
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading stays</span>
          {showSkeleton && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <p role="status" className="mt-4 text-sm text-gray-600">
            {data.total} stay{data.total === 1 ? "" : "s"} found{category ? ` in ${category}` : ""}
          </p>
          {data.listings.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-gray-700">No stays match your filters{category ? ` in "${category}"` : ""}.</p>
              <button type="button" onClick={clearFilters} className="mt-3 font-semibold text-brand underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.listings.map((l) => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
          <Pagination page={page} totalPages={data.totalPages} onChange={(p) => setParam("page", String(p))} />
        </>
      )}
    </div>
  );
}