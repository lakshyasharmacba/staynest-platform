import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true, timeout: 30000 });

export const getError = (err) => {
  const msg = err.response?.data?.message;
  if (msg) return msg; // backend ne khud message diya (validation, 404, 409 ...)

  if (err.code === "ECONNABORTED") return "The server is taking too long to respond. Please try again.";

  // Response aaya hi nahi (backend band hai) ya proxy ne khali 5xx diya
  if (!err.response || err.response.status >= 500) {
    return "Cannot reach the server right now. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
};

export default api;