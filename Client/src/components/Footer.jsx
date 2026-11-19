import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();

  // Login / Signup pe chhota footer
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/verify-otp" || pathname === "/forgot-password";

  if (isAuthPage) {
    return (
      <footer className="mt-auto border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Wanderlust. All rights reserved.
      </footer>
    );
  }

  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand – left */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-xl font-bold text-brand">
              Wanderlust
            </Link>
            <p className="mt-2 max-w-xs text-sm text-gray-600">
              Find unique places to stay, or share your own space with travellers.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              ✉ support@example.test
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-gray-900">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-brand">Browse all stays</Link></li>
              <li><Link to="/?category=Beach" className="hover:text-brand">Beach stays</Link></li>
              <li><Link to="/?category=Mountains" className="hover:text-brand">Mountain stays</Link></li>
              <li><Link to="/?category=City" className="hover:text-brand">City stays</Link></li>
              <li><Link to="/?category=Luxury" className="hover:text-brand">Luxury stays</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-gray-900">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link to="/login" className="hover:text-brand">Log in</Link></li>
              <li><Link to="/signup" className="hover:text-brand">Create an account</Link></li>
              <li><Link to="/profile" className="hover:text-brand">My profile</Link></li>
              <li><Link to="/bookings" className="hover:text-brand">My bookings</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand">Saved stays</Link></li>
              <li><Link to="/host" className="hover:text-brand">Hosting</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a href="mailto:support@example.test" className="hover:text-brand">Help Center</a></li>
              <li><a href="mailto:support@example.test" className="hover:text-brand">FAQs</a></li>
              <li><a href="mailto:support@example.test" className="hover:text-brand">Booking assistance</a></li>
              <li><a href="mailto:support@example.test" className="hover:text-brand">Contact us</a></li>
            </ul>
          </div>

          {/* Company – Support ke bilkul saath */}
          <div>
            <h4 className="font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><span className="cursor-default">About us</span></li>
              <li><span className="cursor-default">Privacy policy</span></li>
              <li><span className="cursor-default">Terms and conditions</span></li>
              <li><span className="cursor-default">Cancellation policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Wanderlust. All rights reserved.
        </div>
      </div>
    </footer>
  );
}