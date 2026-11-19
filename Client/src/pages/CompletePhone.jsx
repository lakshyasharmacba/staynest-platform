import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function CompletePhone() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already has phone → home
  if (user?.phone) {
    navigate("/", { replace: true });
    return null;
  }

  const phoneError =
    !phone
      ? ""
      : !PHONE_RE.test(phone)
        ? "Enter a valid 10-digit number starting with 6, 7, 8 or 9."
        : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PHONE_RE.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.patch("/auth/me", { phone });
      setUser(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
      <div>
        <h2 className="text-2xl font-bold">Add your mobile number</h2>
        <p className="mt-1 text-sm text-gray-600">
          Required for booking and payment. Host can contact you after confirmation.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="phone" className="label">
          Mobile number
        </label>
        <input
          id="phone"
          className="input"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          autoComplete="tel"
          required
        />
        {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
      </div>

      <button className="btn" disabled={loading || phone.length !== 10 || !!phoneError}>
        {loading ? "Saving..." : "Save & continue"}
      </button>
    </form>
  );
}