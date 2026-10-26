import { useEffect, useRef, useState } from "react";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Ye rules backend (Server/schema.js) ke rules jaise hi hain
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

// Edit mode me nahi hain to field locked (grey) dikhta hai
const lockedClass = "disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-800";

export default function Profile() {
  const { user, setUser } = useAuth();

  const savedPhone = user.phone || "";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, phone: savedPhone });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const usernameRef = useRef(null);

  // Edit dabate hi pehla field active ho jaye
  useEffect(() => {
    if (editing) usernameRef.current?.focus();
  }, [editing]);

  const username = form.username.trim();

  let usernameError = "";
  if (!username) usernameError = "Username is required.";
  else if (!USERNAME_RE.test(username)) usernameError = "Use only letters, numbers and underscore (_). No spaces or symbols.";
  else if (username.length < 3 || username.length > 30) usernameError = "Username must be 3 to 30 characters.";

  let phoneError = "";
  if (!form.phone && savedPhone) phoneError = "Mobile number cannot be empty.";
  else if (form.phone && !PHONE_RE.test(form.phone)) phoneError = "Enter a valid 10-digit number starting with 6, 7, 8 or 9.";

  const usernameChanged = username !== user.username;
  const phoneChanged = form.phone !== savedPhone;
  const canSave = editing && !saving && (usernameChanged || phoneChanged) && !usernameError && !phoneError;

  const startEdit = () => {
    setForm({ username: user.username, phone: savedPhone });
    setError("");
    setMessage("");
    setEditing(true);
  };

  // Cancel: jo kuch type kiya tha wo hat jata hai, purani saved value wapas
  const cancelEdit = () => {
    setForm({ username: user.username, phone: savedPhone });
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setError("");
    setMessage("");
    setSaving(true);

    // Sirf wahi fields bhejo jo badle hain
    const payload = {};
    if (usernameChanged) payload.username = username;
    if (phoneChanged) payload.phone = form.phone;

    try {
      const res = await api.patch("/auth/me", payload);
      setUser(res.data.user); // navbar me bhi naya naam turant dikhega
      setForm({ username: res.data.user.username, phone: res.data.user.phone || "" });
      setEditing(false); // wapas locked mode
      setMessage("Your profile has been updated.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
      {/* Header: avatar + naam + Edit button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold uppercase text-white">
            {user.username.charAt(0)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">@{user.username}</h2>
            <p className="truncate text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        {!editing && (
          <button
            key="edit-btn"
            type="button"
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <PencilIcon />
            Edit
          </button>
        )}
      </div>

      {editing && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-sm text-blue-800">
          You are editing your profile. Click <b>Save changes</b> when you are done, or <b>Cancel</b> to keep things as they were.
        </p>
      )}
      {message && (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Username */}
      <div>
        <label htmlFor="profile-username" className="label">Username</label>
        <input
          id="profile-username"
          ref={usernameRef}
          className={`input ${lockedClass}`}
          value={editing ? form.username : `@${user.username}`}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="Choose a username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          maxLength={30}
          disabled={!editing}
          aria-invalid={editing && Boolean(usernameError)}
        />
        {editing && usernameError ? (
          <p className="mt-1 text-xs text-red-600">{usernameError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-600">Your unique name on Wanderlust.</p>
        )}
      </div>

      {/* Email: hamesha locked (verified) */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="profile-email" className="label !mb-0">Email address</label>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">✓ Verified</span>
        </div>
        <input id="profile-email" className={`input ${lockedClass}`} value={user.email} disabled />
        <p className="mt-1 text-xs text-gray-600">Email cannot be changed because it is used to verify your account.</p>
      </div>

      {/* Mobile */}
      <div>
        <label htmlFor="profile-phone" className="label">Mobile number</label>
        <div className="flex">
          <span className={`inline-flex items-center rounded-l-lg border border-r-0 bg-gray-50 px-3 text-sm font-medium text-gray-700 ${editing ? "border-gray-500" : "border-gray-300"}`}>+91</span>
          <input
            id="profile-phone"
            className={`input !rounded-l-none ${lockedClass}`}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
            placeholder={editing ? "Enter your mobile number" : "Not added yet"}
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            disabled={!editing}
            aria-invalid={editing && Boolean(phoneError)}
          />
        </div>
        {editing && phoneError ? (
          <p className="mt-1 text-xs text-red-600">{phoneError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-600">Hosts and guests use this number to contact you about bookings.</p>
        )}
      </div>

      {editing && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button key="cancel-btn" type="button" onClick={cancelEdit} disabled={saving} className="rounded-lg border border-gray-300 bg-white py-2 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button key="save-btn" type="submit" disabled={!canSave} className="rounded-lg bg-brand py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}