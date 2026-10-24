import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sirf admin user hi is route ko open kar sakta hai, baaki sab ko home page pe bhej do
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-10 text-center text-gray-500">Loading...</p>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
