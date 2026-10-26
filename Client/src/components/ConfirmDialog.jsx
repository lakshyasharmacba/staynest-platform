import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable confirmation popup (logout, delete, cancel booking...)
 * - Esc dabane par ya bahar (dark area) click karne par band hota hai
 * - Khulte hi focus "Cancel" par aata hai (galti se Enter dabane par kuch delete/logout na ho)
 * - Tab key popup ke andar hi ghoomti hai, peeche ka page scroll nahi hota
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  error = "",
  icon = null,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  // Latest values refs me rakhe, taaki effect baar baar na chale
  const loadingRef = useRef(loading);
  const onCancelRef = useRef(onCancel);
  loadingRef.current = loading;
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!loadingRef.current) onCancelRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const buttons = dialogRef.current?.querySelectorAll("button:not([disabled])");
      if (!buttons || buttons.length === 0) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark backdrop: click karne par popup band */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={() => {
          if (!loading) onCancel?.();
        }}
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-brand">
            {icon}
          </div>
        )}

        <h2 id={titleId} className="text-center text-lg font-bold text-gray-900">
          {title}
        </h2>
        <p id={messageId} className="mt-1.5 text-center text-sm text-gray-600">
          {message}
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}