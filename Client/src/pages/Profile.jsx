import { useState } from "react";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user.phone || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.patch("/auth/me", { phone });
      setUser(res.data.user); // navbar / baaki app me bhi update
      setMessage("Mobile number updated.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-2xl font-bold">My profile</h2>
      {message && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <label className="block text-sm text-gray-600">Username
        <input className="input mt-1 bg-gray-100" value={user.username} disabled />
      </label>
      <label className="block text-sm text-gray-600">Email (verified)
        <input className="input mt-1 bg-gray-100" value={user.email} disabled />
      </label>
      <label className="block text-sm text-gray-600">Mobile number
        <input className="input mt-1" value={phone} maxLength={10} inputMode="numeric" onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} required />
      </label>
      <button className="btn" disabled={loading || phone === user.phone}>{loading ? "Saving..." : "Save"}</button>
    </form>
  );
}
