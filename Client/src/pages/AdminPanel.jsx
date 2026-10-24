import { useCallback, useEffect, useState } from "react";
import api, { getError } from "../api/axios";
import Pagination from "../components/Pagination";
import { formatDate, formatPrice } from "../utils";

export default function AdminPanel() {
  const [tab, setTab] = useState("overview"); // overview | users | listings | bookings | logs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Tab Data States
  const [stats, setStats] = useState(null);

  // Users tab
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Listings tab
  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState("");
  const [listingPage, setListingPage] = useState(1);
  const [listingTotalPages, setListingTotalPages] = useState(1);

  // Bookings tab
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);

  // Logs tab
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // --- Load Stats ---
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Load Users ---
  const loadUsers = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      setUsers(res.data.users);
      setUserPage(res.data.page);
      setUserTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Load Listings ---
  const loadListings = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/listings?page=${page}&search=${encodeURIComponent(search)}`);
      setListings(res.data.listings);
      setListingPage(res.data.page);
      setListingTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Load Bookings ---
  const loadBookings = useCallback(async (page = 1, status = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bookings?page=${page}&status=${status}`);
      setBookings(res.data.bookings);
      setBookingPage(res.data.page);
      setBookingTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Load Audit Logs ---
  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/logs?page=${page}`);
      setLogs(res.data.logs);
      setLogPage(res.data.page);
      setLogTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch tabs
  useEffect(() => {
    setError("");
    setMessage("");
    if (tab === "overview") loadStats();
    if (tab === "users") loadUsers(userPage, userSearch);
    if (tab === "listings") loadListings(listingPage, listingSearch);
    if (tab === "bookings") loadBookings(bookingPage, bookingStatus);
    if (tab === "logs") loadLogs(logPage);
  }, [tab, userPage, listingPage, bookingPage, logPage, loadStats, loadUsers, loadListings, loadBookings, loadLogs]);

  // Actions
  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} user "${user.username}"?`)) return;
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/users/${user._id}/block`, { blocked: !user.isBlocked });
      setMessage(`User ${user.username} ${action}ed successfully.`);
      loadUsers(userPage, userSearch);
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleDeleteListing = async (listing) => {
    if (!window.confirm(`Delete listing "${listing.title}" as Admin? This cannot be undone.`)) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/listings/${listing._id}`);
      setMessage(`Listing "${listing.title}" deleted.`);
      loadListings(listingPage, listingSearch);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 rounded-lg bg-gray-100 p-1">
          {["overview", "users", "listings", "bookings", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                tab === t ? "bg-white text-brand shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t === "logs" ? "Audit Log" : t}
            </button>
          ))}
        </div>
      </div>

      {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* ================= TAB 1: OVERVIEW ================= */}
      {tab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Users" value={stats.users} />
            <StatCard label="Blocked Users" value={stats.blockedUsers} color="text-red-600" />
            <StatCard label="Total Listings" value={stats.listings} />
            <StatCard label="Confirmed Revenue" value={formatPrice(stats.revenue)} color="text-green-600" />
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Bookings by Status</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <span className="text-xs uppercase text-amber-700 font-semibold">Pending</span>
                <p className="text-2xl font-bold text-amber-800">{stats.bookings.pending || 0}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <span className="text-xs uppercase text-green-700 font-semibold">Confirmed</span>
                <p className="text-2xl font-bold text-green-800">{stats.bookings.confirmed || 0}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 text-center">
                <span className="text-xs uppercase text-rose-700 font-semibold">Cancelled</span>
                <p className="text-2xl font-bold text-rose-800">{stats.bookings.cancelled || 0}</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <span className="text-xs uppercase text-gray-600 font-semibold">Expired</span>
                <p className="text-2xl font-bold text-gray-700">{stats.bookings.expired || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USERS ================= */}
      {tab === "users" && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUserPage(1);
              loadUsers(1, userSearch);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Search by username, email, phone..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
            />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{u.username}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`rounded px-3 py-1 text-xs font-semibold text-white transition ${
                            u.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={userPage} totalPages={userTotalPages} onChange={setUserPage} />
        </div>
      )}

      {/* ================= TAB 3: LISTINGS ================= */}
      {tab === "listings" && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setListingPage(1);
              loadListings(1, listingSearch);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Search by title, location..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
            />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Price / night</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{l.title}</td>
                    <td className="p-3">{l.location}, {l.country}</td>
                    <td className="p-3">{l.owner?.username || "—"}</td>
                    <td className="p-3">{formatPrice(l.price)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteListing(l)}
                        className="rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">No listings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={listingPage} totalPages={listingTotalPages} onChange={setListingPage} />
        </div>
      )}

      {/* ================= TAB 4: BOOKINGS ================= */}
      {tab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={bookingStatus}
              onChange={(e) => {
                setBookingStatus(e.target.value);
                setBookingPage(1);
                loadBookings(1, e.target.value);
              }}
              className="rounded-lg border px-3 py-1.5 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Listing</th>
                  <th className="p-3">Guest</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs text-gray-500">{b._id}</td>
                    <td className="p-3 font-medium text-gray-900">{b.listing?.title || "—"}</td>
                    <td className="p-3">{b.guest?.username || "—"} ({b.guest?.phone})</td>
                    <td className="p-3 text-xs">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                    <td className="p-3 font-semibold">{formatPrice(b.totalAmount)}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        b.status === "confirmed" ? "bg-green-100 text-green-700" :
                        b.status === "pending" ? "bg-amber-100 text-amber-700" :
                        b.status === "cancelled" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={bookingPage} totalPages={bookingTotalPages} onChange={setBookingPage} />
        </div>
      )}

      {/* ================= TAB 5: AUDIT LOG ================= */}
      {tab === "logs" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold">
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        log.action.includes("BLOCK") ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-900">{log.admin?.username || log.admin?.email || "Admin"}</td>
                    <td className="p-3 text-xs">{log.targetType} ({log.targetId})</td>
                    <td className="p-3 text-xs text-gray-500">{JSON.stringify(log.details)}</td>
                    <td className="p-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">No audit log entries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={logPage} totalPages={logTotalPages} onChange={setLogPage} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
