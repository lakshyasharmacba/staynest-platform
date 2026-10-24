import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("OTP sent to your email");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60); // resend countdown

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (!email) return <Navigate to="/signup" replace />; // seedha URL kholne pe

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setUser(res.data.user); // verify hote hi login
      navigate("/", { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await api.post("/auth/resend-otp", { email, purpose: "signup" });
      setInfo("New OTP sent");
      setSeconds(60);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <form onSubmit={handleVerify} className="card space-y-4">
      <h2 className="text-2xl font-bold">Verify your email</h2>
      <p className="text-sm text-gray-600">{info}: <b>{email}</b></p>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <input
        className="input text-center text-2xl tracking-[0.5em]"
        placeholder="------"
        maxLength={6}
        inputMode="numeric"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        required
      />
      <button className="btn" disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify"}</button>
      <button type="button" onClick={handleResend} disabled={seconds > 0} className="w-full text-sm font-semibold text-brand disabled:text-gray-400">
        {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
      </button>
    </form>
  );
}
