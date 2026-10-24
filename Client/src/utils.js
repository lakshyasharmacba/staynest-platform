export const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
export const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Local timezone ke hisaab se aaj ki date "YYYY-MM-DD" (date input ke min ke liye)
export const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (24 * 60 * 60 * 1000));

// Razorpay checkout script sirf tab load hoti hai jab payment karni ho
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
