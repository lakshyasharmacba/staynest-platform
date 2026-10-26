import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

/* ---------- Chhote icons (stroke style, text ke rang me) ---------- */
function Icon({ d, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  logout: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75",
  chevron: "M19.5 8.25l-7.5 7.5-7.5-7.5",
};

/* Username ka pehla akshar, gol avatar me */
function Avatar({ name, size = "h-8 w-8 text-sm" }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand font-bold uppercase text-white`}>
      {(name || "?").charAt(0)}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimer = useRef(null);
  const lastPointer = useRef("mouse");

  // Mouse hover par menu kholo; mouse hatne par thodi der baad band (flicker na ho)
  const openNow = () => {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 150);
  };

  // Page badalne par menu band
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Bahar click / touch ya Esc dabane par band
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* ---------- Logout: pehle "Are you sure?" popup ---------- */
  const askLogout = () => {
    setMenuOpen(false);
    setLogoutError("");
    setConfirmOpen(true);
  };

  const cancelLogout = () => {
    if (!loggingOut) setConfirmOpen(false);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      setConfirmOpen(false);
      navigate("/");
    } catch {
      setLogoutError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    { to: "/profile", label: "My profile", icon: ICONS.user },
    { to: "/bookings", label: "My bookings", icon: ICONS.calendar },
    { to: "/wishlist", label: "Saved stays", icon: ICONS.heart },
    { to: "/host", label: "Host dashboard", icon: ICONS.home },
  ];
  if (user?.role === "admin") menuItems.push({ to: "/admin", label: "Admin panel", icon: ICONS.shield, admin: true });

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-2.5 shadow-sm sm:px-6">
        <Link to="/" className="text-xl font-bold text-brand">
          Wanderlust
        </Link>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {user ? (
            <>
              <Link
                to="/host"
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-100 sm:inline-flex"
              >
                <Icon d={ICONS.home} className="h-4 w-4" />
                Host
              </Link>

              {/* Profile icon + dropdown (hover / click dono se khulta hai) */}
              <div
                ref={wrapperRef}
                className="relative"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") openNow();
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") closeSoon();
                }}
                onBlur={(e) => {
                  // Keyboard se Tab karke bahar nikle to band
                  if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) closeSoon();
                }}
              >
                <button
                  ref={buttonRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  onPointerDown={(e) => {
                    lastPointer.current = e.pointerType;
                  }}
                  onClick={() => {
                    // Mouse se hover pe pehle hi khul chuka hota hai -> click par khula hi rahe; touch/keyboard par toggle
                    if (lastPointer.current === "mouse") setMenuOpen(true);
                    else setMenuOpen((o) => !o);
                    lastPointer.current = "keyboard";
                  }}
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition hover:shadow-md ${
                    menuOpen ? "border-gray-400 shadow-md" : "border-gray-300"
                  }`}
                >
                  <Avatar name={user.username} />
                  <span className="hidden max-w-[110px] truncate font-semibold text-gray-800 sm:inline">{user.username}</span>
                  <Icon d={ICONS.chevron} className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  // pt-2 = button aur menu ke beech "bridge", taaki mouse le jaate waqt menu band na ho
                  <div className="absolute right-0 top-full z-50 w-72 pt-2">
                    <div role="menu" aria-label="Account" className="overflow-hidden rounded-xl border bg-white shadow-xl">
                      <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-3">
                        <Avatar name={user.username} size="h-10 w-10 text-base" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-semibold text-gray-900">
                            @{user.username}
                            {user.role === "admin" && (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700">Admin</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>

                      <div className="py-1">
                        {menuItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            role="menuitem"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 ${
                              item.admin ? "text-purple-700" : "text-gray-800"
                            }`}
                          >
                            <Icon d={item.icon} className="h-5 w-5 text-gray-500" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t py-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={askLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-brand hover:bg-rose-50"
                        >
                          <Icon d={ICONS.logout} className="h-5 w-5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-100">
                Login
              </Link>
              <Link to="/signup" className="rounded-lg bg-brand px-4 py-1.5 font-semibold text-white hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out of Wanderlust?"
        message="Are you sure you want to log out? You will need to log in again to see your bookings and saved stays."
        confirmText="Yes, log out"
        cancelText="Stay logged in"
        loading={loggingOut}
        error={logoutError}
        icon={<Icon d={ICONS.logout} className="h-6 w-6" />}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}