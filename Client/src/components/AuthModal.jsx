import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AuthModal({ open, onClose, title = "Save this stay to your wishlist" }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-brand">
          ♥
        </div>

        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">
          Log in or create a free account to keep your favourite places in one list and find them again on any device.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            Your saved stays are always with you
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            We will save this stay right after you log in
          </li>
        </ul>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="w-full rounded-xl bg-brand py-3 text-center font-semibold text-white hover:opacity-90"
          >
            Log in
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/signup");
            }}
            className="w-full rounded-xl border border-gray-300 py-3 text-center font-semibold text-gray-800 hover:bg-gray-50"
          >
            Create an account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}