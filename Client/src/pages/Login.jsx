import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      setUser(res.data.user);
      navigate(location.state?.from || "/", { replace: true }); // jis page se aaye the wahin wapas
    } catch (err) {
      // Email verify nahi hai -> backend ne naya OTP bhej diya, OTP screen pe bhejo
      if (err.response?.data?.needsVerification) {
        return navigate("/verify-otp", { state: { email: err.response.data.email } });
      }
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <input className="input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button className="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      
      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative my-2 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-white px-2 text-xs uppercase text-gray-400">or</span>
          </div>
          <GoogleAuthButton onError={setError} />
        </>
      )}

      <div className="flex justify-between text-sm pt-2">
        <Link to="/forgot-password" className="text-brand">Forgot password?</Link>
        <Link to="/signup" className="font-semibold text-brand">Create account</Link>
      </div>
    </form>
  );
}
