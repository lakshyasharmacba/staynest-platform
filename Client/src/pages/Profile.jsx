import { useEffect, useRef, useState } from "react";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const lockedClass = "disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-800";

export default function Profile() {
  const { user, setUser } = useAuth();

  const savedPhone = user.phone || "";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user.username,
    phone: savedPhone,
    email: user.email,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Email change OTP flow
  const [otpStep, setOtpStep] = useState(false);   // true = OTP input dikhao
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const usernameRef = useRef(null);

  useEffect(() => {
    if (editing && !otpStep) usernameRef.current?.focus();
  }, [editing, otpStep]);

  // ---------- Validation ----------
  const username = form.username.trim();
  let usernameError = "";
  if (!username) usernameError = "Username is required.";
  else if (!USERNAME_RE.test(username)) usernameError = "Use only letters, numbers and underscore (_).";
  else if (username.length < 3 || username.length > 30) usernameError = "Username must be 3 to 30 characters.";

  let phoneError = "";
  if (!form.phone && savedPhone) phoneError = "Mobile number cannot be empty.";
  else if (form.phone && !PHONE_RE.test(form.phone)) phoneError = "Enter a valid 10-digit number starting with 6-9.";

  const email = form.email.trim().toLowerCase();
  let emailError = "";
  if (!email) emailError = "Email is required.";
  else if (!EMAIL_RE.test(email)) emailError = "Enter a valid email address.";

  const usernameChanged = username !== user.username;
  const phoneChanged = form.phone !== savedPhone;
  const emailChanged = email !== user.email;

  const canSave =
    editing &&
    !saving &&
    (usernameChanged || phoneChanged || emailChanged) &&
    !usernameError &&
    !phoneError &&
    !emailError;

  // ---------- Handlers ----------
  const startEdit = () => {
    setForm({ username: user.username, phone: savedPhone, email: user.email });
    setError("");
    setMessage("");
    setOtpStep(false);
    setOtp("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm({ username: user.username, phone: savedPhone, email: user.email });
    setError("");
    setOtpStep(false);
    setOtp("");
    setEditing(false);
  };

  // Step 1: Save dabaya → agar email change hua to OTP bhejo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (emailChanged) {
        // Pehle naye email pe OTP bhejo
        await api.post("/auth/request-email-change", { newEmail: email });
        setPendingEmail(email);
        setOtpStep(true);
        setMessage(`OTP sent to ${email}. Please enter it below.`);
      } else {
        // Sirf username / phone change
        const payload = {};
        if (usernameChanged) payload.username = username;
        if (phoneChanged) payload.phone = form.phone;

        const res = await api.patch("/auth/me", payload);
        setUser(res.data.user);
        setForm({
          username: res.data.user.username,
          phone: res.data.user.phone || "",
          email: res.data.user.email,
        });
        setEditing(false);
        setMessage("Your profile has been updated.");
      }
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  // Step 2: OTP verify + final update
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const payload = {
        newEmail: pendingEmail,
        otp,
      };
      if (usernameChanged) payload.username = username;
      if (phoneChanged) payload.phone = form.phone;

      const res = await api.post("/auth/verify-email-change", payload);
      setUser(res.data.user);
      setForm({
        username: res.data.user.username,
        phone: res.data.user.phone || "",
        email: res.data.user.email,
      });
      setEditing(false);
      setOtpStep(false);
      setOtp("");
      setMessage("Email updated successfully! All future messages will go to your new email.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={otpStep ? handleVerifyOtp : handleSubmit} className="card space-y-5" noValidate>
      {/* Header */}
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
            type="button"
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <PencilIcon />
            Edit
          </button>
        )}
      </div>

      {editing && !otpStep && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-sm text-blue-800">
          You are editing your profile. If you change email, we will send an OTP to the <b>new</b> email for verification.
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

      {/* ========== OTP Step ========== */}
      {otpStep ? (
        <div className="space-y-4">
          <div>
            <label className="label">Enter OTP sent to {pendingEmail}</label>
            <input
              className="input tracking-widest"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn flex-1" disabled={saving || otp.length !== 6}>
              {saving ? "Verifying..." : "Verify & Update Email"}
            </button>
            <button type="button" onClick={cancelEdit} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ========== Normal Edit Form ========== */
        <>
          {/* Username */}
          <div>
            <label className="label">Username</label>
            <input
              ref={usernameRef}
              className={`input ${lockedClass}`}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={!editing}
              required
            />
            {editing && usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              className={`input ${lockedClass}`}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!editing}
              required
            />
            {editing && emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            {editing && emailChanged && (
              <p className="mt-1 text-xs text-amber-600">
                Changing email will require OTP verification on the new address.
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Mobile number</label>
            <input
              className={`input ${lockedClass}`}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              disabled={!editing}
              placeholder="10-digit number"
            />
            {editing && phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn flex-1" disabled={!canSave}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" onClick={cancelEdit} className="rounded-lg border px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </form>
  );
}