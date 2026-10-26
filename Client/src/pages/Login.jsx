import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";
import PasswordInput from "../components/PasswordInput";

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
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      setUser(res.data.user);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      // Email verify nahi hai -> backend ne naya OTP bhej diya, OTP screen pe bhejo
      if (err.response?.data?.needsVerification) {
        const verifyEmail = err.response.data.email;
        sessionStorage.setItem("pending_otp_email", verifyEmail);
        return navigate("/verify-otp", { state: { email: verifyEmail } });
      }
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Enter your details to continue.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <GoogleAuthButton onError={setError} />

      <div>
        <label htmlFor="login-id" className="label">Email or username</label>
        <input
          id="login-id"
          className="input"
          type="text"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          required
        />
      </div>

      <div>
        <label htmlFor="login-password" className="label">Password</label>
        <PasswordInput
          id="login-password"
          name="password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </div>

      <button className="btn" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>

      <div className="flex items-center justify-between pt-1 text-sm">
        <Link to="/forgot-password" className="font-semibold text-brand hover:underline">
          Forgot password?
        </Link>
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}