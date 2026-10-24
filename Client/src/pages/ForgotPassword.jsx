import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      navigate("/login");
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={step === 1 ? sendOtp : resetPassword} className="card space-y-4">
      <h2 className="text-2xl font-bold">Reset password</h2>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      {step === 1 ? (
        <>
          <input className="input" type="email" placeholder="Registered email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">If this email is registered, an OTP has been sent to <b>{email}</b></p>
          <input className="input text-center tracking-[0.4em]" placeholder="6 digit OTP" maxLength={6} inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required />
          <input className="input" type="password" placeholder="New password (8+ chars, letter + number)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <button className="btn" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
        </>
      )}
      <p className="text-center text-sm"><Link to="/login" className="text-brand">Back to login</Link></p>
    </form>
  );
}
