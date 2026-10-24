export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="my-8 flex flex-wrap items-center justify-center gap-2">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Prev</button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded border px-3 py-1 ${p === page ? "bg-brand text-white" : "bg-white"}`}
        >
          {p}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
    </div>
  );
}
