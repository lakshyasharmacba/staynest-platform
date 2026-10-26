import { useState } from "react";

// Default SVG placeholder in case image fails to load or URL is empty
const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=75";

/**
 * Optimizes Unsplash and Cloudinary URLs for thumbnail performance:
 * - Reduces multi-megabyte raw images down to fast, crisp WebP/JPEG thumbnails (~80KB)
 * - Drastically speeds up initial site load
 */
function optimizeImageUrl(url, width = 800) {
  if (!url || typeof url !== "string") return DEFAULT_FALLBACK_IMAGE;

  // Unsplash URL optimization (reduce width and quality for fast loading)
  if (url.includes("images.unsplash.com")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=75`;
  }

  // Cloudinary URL optimization (f_auto, q_auto for automatic format and compression)
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }

  return url;
}

/**
 * ImageWithFallback:
 * 1. Shimmer skeleton loader while image downloads (no blank space or broken icon flash)
 * 2. Smooth fade-in transition when loaded
 * 3. Graceful fallback to default image if URL fails (onError)
 */
export default function ImageWithFallback({
  src,
  alt = "Listing image",
  className = "h-48 w-full object-cover",
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  width = 800,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const targetSrc = error || !src ? fallbackSrc : optimizeImageUrl(src, width);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className.includes("rounded") ? "" : ""}`}>
      {/* 1. Shimmer Skeleton Placeholder while image is loading */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* 2. Actual Image with smooth fade-in and error handler */}
      <img
        src={targetSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}
