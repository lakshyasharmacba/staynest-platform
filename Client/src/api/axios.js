import axios from "axios";

// withCredentials: true => httpOnly JWT cookie har request ke saath jati hai
const api = axios.create({ baseURL: "/api", withCredentials: true });

// Backend ka error message nikalne ka helper
export const getError = (err) => err.response?.data?.message || "Something went wrong. Please try again.";

export default api;
