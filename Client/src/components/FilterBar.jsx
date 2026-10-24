const CATEGORIES = ["Rooms", "Trending", "Mountains", "Beach", "City", "Farms", "Camping", "Luxury"];

export default function FilterBar({ search, setSearch, params, setParam }) {
  return (
    <div className="space-y-4">
      <input
        className="input"
        placeholder="Search by title, city, country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((c) => {
          const active = (params.get("category") || "All") === c;
          return (
            <button
              key={c}
              onClick={() => setParam("category", c === "All" ? "" : c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${active ? "bg-brand text-white" : "bg-white"}`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Price + sort */}
      <div className="flex flex-wrap gap-3">
        <input className="input !w-32" type="number" min="0" placeholder="Min ₹" value={params.get("minPrice") || ""} onChange={(e) => setParam("minPrice", e.target.value)} />
        <input className="input !w-32" type="number" min="0" placeholder="Max ₹" value={params.get("maxPrice") || ""} onChange={(e) => setParam("maxPrice", e.target.value)} />
        <select className="input !w-48" value={params.get("sort") || "newest"} onChange={(e) => setParam("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
    </div>
  );
}
