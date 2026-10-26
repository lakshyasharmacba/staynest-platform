const CATEGORIES = ["Rooms", "Trending", "Mountains", "Beach", "City", "Farms", "Camping", "Luxury"];

export default function FilterBar({ search, setSearch, params, setParam }) {
  const activeCategory = params.get("category") || "All";

  return (
    <div role="search" className="space-y-4">
      {/* Search: label screen-reader ke liye (sr-only), placeholder sirf example hai, label ka replacement nahi */}
      <div>
        <label htmlFor="search" className="sr-only">Search stays by title, city or country</label>
        <input
          id="search"
          name="search"
          type="search"
          className="input"
          placeholder="Search by title, city or country"
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs: aria-pressed se screen reader ko pata chalta hai kaun sa selected hai */}
      <div role="group" aria-label="Filter by category" className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((c) => {
          const active = activeCategory === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setParam("category", c === "All" ? "" : c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
                active ? "border-brand bg-brand text-white" : "border-gray-400 bg-white text-gray-800 hover:border-gray-700"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Price + sort: har field ka visible label */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="minPrice" className="label">Min price (₹)</label>
          <input
            id="minPrice"
            name="minPrice"
            className="input !w-32"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="e.g. 500"
            value={params.get("minPrice") || ""}
            onChange={(e) => setParam("minPrice", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="label">Max price (₹)</label>
          <input
            id="maxPrice"
            name="maxPrice"
            className="input !w-32"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="e.g. 5000"
            value={params.get("maxPrice") || ""}
            onChange={(e) => setParam("maxPrice", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sort" className="label">Sort by</label>
          <select
            id="sort"
            name="sort"
            className="input !w-48"
            value={params.get("sort") || "newest"}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}