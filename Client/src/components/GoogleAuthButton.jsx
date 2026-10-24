import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthButton({ onError }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      setUser(res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      if (onError) onError(getError(err));
    }
  };

  const handleFailure = () => {
    if (onError) onError("Google Sign-In was unsuccessful. Please try again.");
  };

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  );
}
