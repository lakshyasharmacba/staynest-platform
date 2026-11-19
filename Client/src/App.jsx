import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import ListingDetail from "./pages/ListingDetail";
import MyBookings from "./pages/MyBookings";
import HostDashboard from "./pages/HostDashboard";
import ListingForm from "./pages/ListingForm";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import CompletePhone from "./pages/CompletePhone";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ForgotPassword from "./pages/ForgotPassword";
import AdminPanel from "./pages/AdminPanel";
import BookingLocation from "./pages/BookingLocation";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/bookings/:id/location" element={<ProtectedRoute><BookingLocation /></ProtectedRoute>} />
          <Route path="/host" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/new" element={<ProtectedRoute><ListingForm /></ProtectedRoute>} />
          <Route path="/host/:id/edit" element={<ProtectedRoute><ListingForm /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/complete-phone" element={<ProtectedRoute><CompletePhone /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </div>
  );
}