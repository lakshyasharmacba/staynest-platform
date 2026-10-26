import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const BTN_CLASS =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

// useGoogleLogin sirf <GoogleOAuthProvider> ke andar chalta hai (main.jsx me tabhi lagta hai jab client id ho).
function GoogleButton({ onError }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/";

  const startLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post("/auth/google", { accessToken: tokenResponse.access_token });
        setUser(res.data.user);
        navigate(from, { replace: true });
      } catch (err) {
        onError?.(getError(err));
        setLoading(false);
      }
    },
    onError: () => {
      onError?.("Google sign-in was unsuccessful. Please try again.");
      setLoading(false);
    },
    onNonOAuthError: (e) => {
      setLoading(false);
      if (e?.type === "popup_failed_to_open") {
        onError?.("Your browser blocked the Google popup. Please allow popups for this site and try again.");
      }
    },
  });

  const handleClick = () => {
    onError?.("");
    setLoading(true);
    startLogin();
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={BTN_CLASS}>
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" aria-hidden="true" />
          Connecting to Google...
        </>
      ) : (
        <>
          <GoogleLogo />
          Continue with Google
        </>
      )}
    </button>
  );
}

// Client id na ho tab bhi button dikhta hai; click par saaf message milta hai
function GoogleButtonDisabled({ onError }) {
  return (
    <button
      type="button"
      onClick={() => onError?.("Google sign-in is not set up yet. Add VITE_GOOGLE_CLIENT_ID in Client/.env and restart.")}
      className={BTN_CLASS}
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );
}

export default function GoogleAuthButton({ onError, dividerText = "or" }) {
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="space-y-4">
      {configured ? <GoogleButton onError={onError} /> : <GoogleButtonDisabled onError={onError} />}
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-500" role="separator">
        <span className="h-px flex-1 bg-gray-200" />
        <span>{dividerText}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}