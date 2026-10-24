import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api ki saari requests backend (8080) pe jayengi -> same-origin, cookie issue nahi
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8080" } },
});
