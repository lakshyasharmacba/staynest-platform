import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Login nahi hai to /login pe bhejo (login ke baad wapas isi page pe aayega)
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
