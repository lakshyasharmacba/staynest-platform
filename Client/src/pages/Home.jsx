import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getError } from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import FilterBar from "../components/FilterBar";
import ListingCard from "../components/ListingCard";
import Pagination from "../components/Pagination";

export default function Home() {
  // Filters URL me rehte hain (?category=Beach&page=2) -> refresh / back button / share sab kaam karta hai
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const debouncedSearch = useDebounce(search);

  const [data, setData] = useState({ listings: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Number(params.get("page")) || 1;

  // Ek param change karo; filter badalne pe page 1 pe wapas
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  // Debounced search ko URL me daalo
  useEffect(() => {
    if ((params.get("search") || "") !== debouncedSearch.trim()) setParam("search", debouncedSearch.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // URL badla -> listings dobara fetch
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
  }, [params]);

  return (
    <div className="mx-auto max-w-6xl py-6">
      <FilterBar search={search} setSearch={setSearch} params={params} setParam={setParam} />

      {error && <p className="mt-6 rounded bg-red-50 p-3 text-red-600">{error}</p>}
      {loading && <p className="mt-10 text-center text-gray-500">Loading...</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm text-gray-500">{data.total} places found</p>
          {data.listings.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">No listings match your filters.</p>
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
