import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import GoogleAuthButton from "../components/GoogleAuthButton";
import PasswordInput from "../components/PasswordInput";

// Ye rules backend (Server/schema.js) ke rules jaise hi hain
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const passwordChecks = (pw) => ({
  length: pw.length >= 8,
  letter: /[A-Za-z]/.test(pw),
  number: /\d/.test(pw),
});

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [usernameError, setUsernameError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(form.password);

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    if (val.includes("@")) {
      setUsernameError("This looks like an email. Choose a username instead, like traveler_raj.");
    } else if (val && !USERNAME_RE.test(val)) {
      setUsernameError("Use only letters, numbers and underscore (_). No spaces or symbols.");
    } else {
      setUsernameError("");
    }
    setForm((prev) => ({ ...prev, username: val }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm((prev) => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) })); // sirf digits
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    if (username.length < 3 || username.length > 30 || !USERNAME_RE.test(username)) {
      return setError("Username must be 3 to 30 characters: letters, numbers and underscore (_) only.");
    }
    if (!PHONE_RE.test(form.phone)) {
      return setError("Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
    }
    if (!checks.length || !checks.letter || !checks.number) {
      return setError("Password must have at least 8 characters, including a letter and a number.");
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", { ...form, username, email });

      // Refresh karne par bhi /verify-otp me email na kho jaye
      sessionStorage.setItem("pending_otp_email", email);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="card space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="mt-1 text-sm text-gray-600">Sign up to start booking stays.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <GoogleAuthButton onError={setError} />

      {/* Username */}
      <div>
        <label htmlFor="signup-username" className="label">Username</label>
        <input
          id="signup-username"
          className="input"
          name="username"
          type="text"
          placeholder="Enter a username"
          value={form.username}
          onChange={handleUsernameChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          minLength={3}
          maxLength={30}
          required
        />
        {usernameError ? (
          <p className="mt-1 text-xs text-red-600">{usernameError}</p>
        ) : null}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="label">Email address</label>
        <input
          id="signup-email"
          className="input"
          type="email"
          name="email"
          placeholder="john@gmail.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </div>

      {/* Mobile: +91 alag dikhta hai, user sirf 10 digit likhta hai */}
      <div>
        <label htmlFor="signup-phone" className="label">Mobile number</label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-500 bg-gray-50 px-3 text-sm font-medium text-gray-700">
            +91
          </span>
          <input
            id="signup-phone"
            className="input !rounded-l-none"
            name="phone"
            type="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            title="10-digit mobile number starting with 6, 7, 8 or 9"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel-national"
            required
          />
        </div>
      </div>

      {/* Password: rules tab dikhte hain jab user type karna shuru kare */}
      <div>
        <label htmlFor="signup-password" className="label">Password</label>
        <PasswordInput
          id="signup-password"
          name="password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          maxLength={64}
          required
        />
        {form.password && (
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

      <button className="btn" disabled={loading}>
        {loading ? "Sending verification code..." : "Sign up"}
      </button>

      <p className="pt-1 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}