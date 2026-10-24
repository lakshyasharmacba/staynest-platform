import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      navigate("/verify-otp", { state: { email: form.email.toLowerCase() } }); // OTP screen
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-2xl font-bold">Create account</h2>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <input className="input" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input className="input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="input" name="phone" placeholder="Mobile number (10 digit)" maxLength={10} inputMode="numeric" value={form.phone} onChange={handleChange} required />
      <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button className="btn" disabled={loading}>{loading ? "Sending OTP..." : "Sign up"}</button>
      
      <div className="relative my-2 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <span className="relative bg-white px-2 text-xs uppercase text-gray-400">or</span>
      </div>

      <GoogleAuthButton onError={setError} />

      <p className="text-center text-sm pt-2">Already have an account? <Link to="/login" className="font-semibold text-brand">Login</Link></p>
    </form>
  );
}
