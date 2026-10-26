import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import "leaflet/dist/leaflet.css";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const app = (
  <BrowserRouter>
    <AuthProvider>
      <WishlistProvider>
        <App />
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
      </WishlistProvider>
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {app}
      </GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);