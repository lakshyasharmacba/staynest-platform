const crypto = require("crypto");

// crypto.randomInt = secure random (Math.random predictable hota hai, OTP me kabhi use nahi karte)
const generateOtp = () => String(crypto.randomInt(100000, 1000000));

// DB me OTP plain nahi, HMAC hash store hota hai (DB leak ho to bhi OTP safe)
const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", process.env.OTP_SECRET).update(`${email}:${otp}`).digest("hex");

// timing attack se bachne ke liye constant-time compare
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = { generateOtp, hashOtp, safeEqual };
