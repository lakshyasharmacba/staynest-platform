import { useState } from "react";

// Password field + "Show / Hide" button.
// Button tabhi dikhta hai jab user type karna shuru kare (khali field me nahi).
export default function PasswordInput({ id, className = "", value = "", ...props }) {
  const [show, setShow] = useState(false);
  const hasValue = String(value).length > 0;
  const revealed = show && hasValue; // field khali ho jaye to wapas hidden

  return (
    <div className="relative">
      <input
        id={id}
        type={revealed ? "text" : "password"}
        value={value}
        className={`input ${hasValue ? "pr-16" : ""} ${className}`}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          {revealed ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}