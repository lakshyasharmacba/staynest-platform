import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between border-b bg-white px-6 py-3">
      <Link to="/" className="text-xl font-bold text-brand">Wanderlust</Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/wishlist" className="font-semibold">♥ Saved</Link>
            <Link to="/host" className="font-semibold">Host</Link>
            <Link to="/bookings" className="font-semibold">My bookings</Link>
            {user.role === "admin" && (
              <Link to="/admin" className="font-semibold text-purple-600">Admin</Link>
            )}
            <Link to="/profile" className="text-gray-600 hover:underline">Hi, {user.username}</Link>
            <button onClick={handleLogout} className="font-semibold text-brand">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-semibold">Login</Link>
            <Link to="/signup" className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-white">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
