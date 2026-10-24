// value (0-5) ke hisaab se filled stars; onChange diya ho to clickable
export default function StarRating({ value = 0, onChange }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange && onChange(n)}
          className={`text-xl ${n <= Math.round(value) ? "text-yellow-500" : "text-gray-300"} ${onChange ? "cursor-pointer" : "cursor-default"}`}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
