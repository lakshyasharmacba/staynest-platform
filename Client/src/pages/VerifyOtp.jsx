import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const inputRef = useRef(null);

  // Retrieve email from React Router state OR sessionStorage (so page refresh doesn't break)
  const [email] = useState(() => {
    return state?.email || sessionStorage.getItem("pending_otp_email") || "";
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("We sent a 6-digit verification code to");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60); // 60s cooldown

  // Auto-focus input on page load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // If no email is available, safely redirect back to signup
  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  if (!email) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return setError("Please enter the complete 6-digit OTP");
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      // Clear pending verification email from storage
      sessionStorage.removeItem("pending_otp_email");

      setUser(res.data.user); // Log the user in immediately
      navigate("/", { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || resending) return;

    setError("");
    setResending(true);

    try {
      await api.post("/auth/resend-otp", { email, purpose: "signup" });
      setInfo("A new verification code has been sent to");
      setSeconds(60);
      setOtp("");
      inputRef.current?.focus();
    } catch (err) {
      setError(getError(err));
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    sessionStorage.removeItem("pending_otp_email");
    navigate("/signup", { replace: true });
  };

  return (
    <form onSubmit={handleVerify} className="card space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-brand">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="mt-1 text-sm text-gray-500">
          {info}:
        </p>
        <p className="font-semibold text-gray-800 break-all">{email}</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-2.5 text-center text-sm text-red-600 border border-red-200">
          {error}
        </p>
      )}

      {/* 6-digit OTP input with nice formatting */}
      <div>
        <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Enter 6-Digit Code
        </label>
        <input
          ref={inputRef}
          className="input text-center text-3xl font-mono tracking-[0.4em] font-bold py-3 bg-gray-50 focus:bg-white transition"
          placeholder="••••••"
          maxLength={6}
          inputMode="numeric"
          pattern="\d{6}"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoComplete="one-time-code"
          required
        />
        <p className="mt-1.5 text-center text-[11px] text-gray-400">
          Valid for 10 minutes. Check your inbox and spam folder.
        </p>
      </div>

      <button className="btn" disabled={loading || otp.length !== 6}>
        {loading ? "Verifying..." : "Confirm & Continue"}
      </button>

      {/* Resend button with active cooldown counter */}
      <div className="flex flex-col items-center gap-2 pt-2 text-sm text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={seconds > 0 || resending}
          className="font-semibold text-brand hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          {resending
            ? "Sending new code..."
            : seconds > 0
            ? `Resend code in ${seconds}s`
            : "Didn't receive code? Resend OTP"}
        </button>

        {/* Change email button if typo in signup */}
        <button
          type="button"
          onClick={handleChangeEmail}
          className="text-xs text-gray-500 hover:text-gray-800 hover:underline pt-1"
        >
          Wrong email address? Go back to signup
        </button>
      </div>
    </form>
  );
}
