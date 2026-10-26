import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const RESEND_SECONDS = 60;

const passwordChecks = (pw) => ({
  length: pw.length >= 8,
  letter: /[A-Za-z]/.test(pw),
  number: /\d/.test(pw),
});

const SUBTITLES = {
  1: "Enter your registered email and we will send you a code.",
  2: "Enter the 6-digit code we emailed you.",
  3: "Choose a new password for your account.",
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cleanEmail = email.trim().toLowerCase();
  const checks = passwordChecks(newPassword);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Resend ka 60 sec timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Step 1: registered email par OTP bhejo (unregistered email par backend error deta hai)
  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: cleanEmail });
      setOtp("");
      setStep(2);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: cleanEmail });
      setInfo("A new code has been sent.");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP check
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/verify-reset-otp", { email: cleanEmail, otp: otp.trim() });
      setStep(3);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: naya password set -> backend login bhi kar deta hai -> home page
  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!checks.length || !checks.letter || !checks.number) {
      return setError("Password must have at least 8 characters, including a letter and a number.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: cleanEmail,
        otp: otp.trim(),
        newPassword,
      });
      setUser(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = step === 1 ? sendOtp : step === 2 ? verifyOtp : resetPassword;

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{step === 3 ? "Set new password" : "Reset password"}</h2>
        <p className="mt-1 text-sm text-gray-600">{SUBTITLES[step]}</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      {info && !error && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-sm text-green-700">{info}</p>
      )}

      {step === 1 && (
        <>
          <div>
            <label htmlFor="fp-email" className="label">Registered email</label>
            <input
              id="fp-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? "Sending code..." : "Send code"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-sm text-blue-700">
            Code sent to <b>{cleanEmail}</b>
          </p>
          <div>
            <label htmlFor="fp-otp" className="label">6-digit code</label>
            <input
              id="fp-otp"
              className="input py-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em]"
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          <button className="btn" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify code"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setInfo(""); }}
              className="font-semibold text-gray-600 hover:underline"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading || cooldown > 0}
              className="font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <label htmlFor="fp-new" className="label">New password</label>
            <PasswordInput
              id="fp-new"
              name="newPassword"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              maxLength={64}
              required
            />
            {newPassword && (
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
                {[
                  ["length", "At least 8 characters"],
                  ["letter", "One letter"],
                  ["number", "One number"],
                ].map(([key, text]) => (
                  <li key={key} className={checks[key] ? "font-medium text-green-700" : "text-gray-600"}>
                    <span aria-hidden="true">{checks[key] ? "✓" : "○"}</span> {text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="fp-confirm" className="label">Confirm password</label>
            <PasswordInput
              id="fp-confirm"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              maxLength={64}
              required
            />
            {mismatch && <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>}
          </div>

          <button className="btn" disabled={loading || mismatch}>
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </>
      )}

      <div className="pt-1 text-center text-sm">
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}