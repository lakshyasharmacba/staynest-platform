const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Otp = require("../models/Otp");
const ExpressError = require("../utils/ExpressError");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { generateOtp, hashOtp, safeEqual } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/sendEmail");

const OTP_VALID_MS = 10 * 60 * 1000; // 10 min
const RESEND_GAP_MS = 60 * 1000; // 60 sec
const MAX_ATTEMPTS = 5;
const DUMMY_HASH = bcrypt.hashSync("dummy-password-1", 10); // timing attack se bachne ke liye

const cookieOptions = {
  httpOnly: true, // JS se cookie padhi nahi ja sakti (XSS safe)
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const sendToken = (res, user, status = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(status).json({ user: publicUser(user) });
};

const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email, phone: u.phone, role: u.role });

// ---- OTP helpers ----
async function issueOtp(email, purpose) {
  const existing = await Otp.findOne({ email, purpose });
  if (existing) {
    const wait = RESEND_GAP_MS - (Date.now() - existing.lastSentAt.getTime());
    if (wait > 0) throw new ExpressError(429, `Please wait ${Math.ceil(wait / 1000)}s before requesting a new OTP`);
  }
  const otp = generateOtp();
  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      otpHash: hashOtp(email, otp),
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_VALID_MS),
    },
    { upsert: true }
  );
  try {
    await sendOtpEmail(email, otp, purpose);
  } catch (err) {
    console.log("Email send failed:", err.message);
    throw new ExpressError(502, "Could not send OTP email. Please try again.");
  }
}

async function checkOtp(email, purpose, otp) {
  const record = await Otp.findOne({ email, purpose });
  if (!record || record.expiresAt < new Date()) throw new ExpressError(400, "OTP expired. Please request a new one.");
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new ExpressError(429, "Too many wrong attempts. Please request a new OTP.");
  }
  if (!safeEqual(record.otpHash, hashOtp(email, otp))) {
    record.attempts += 1;
    await record.save();
    throw new ExpressError(400, `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts left.`);
  }
  await record.deleteOne(); // OTP ek hi baar use ho sakta hai
}

// ---- Controllers ----
module.exports.signup = async (req, res) => {
  const { username, email, phone, password } = req.body;

  await User.deleteOne({ email, isVerified: false }); // pehle ka adhura signup saaf
  if (await User.exists({ email })) throw new ExpressError(409, "Email already registered");
  if (await User.exists({ username })) throw new ExpressError(409, "Username already taken");
  if (await User.exists({ phone })) throw new ExpressError(409, "Phone number already registered");

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, phone, password: hashed });
  await issueOtp(email, "signup");

  res.status(201).json({ message: "OTP sent to your email", email });
};

module.exports.verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ExpressError(404, "Account not found. Please sign up again.");
  if (user.isVerified) throw new ExpressError(400, "Email already verified. Please login.");

  await checkOtp(email, "signup", otp);
  user.isVerified = true;
  await user.save();
  sendToken(res, user); // verify hote hi login
};

module.exports.resendOtp = async (req, res) => {
  const { email, purpose } = req.body;
  const user = await User.findOne({ email });
  const allowed = user && (purpose === "reset" ? user.isVerified : !user.isVerified);
  if (allowed) await issueOtp(email, purpose);
  // account hai ya nahi, ye kabhi reveal nahi karte (user enumeration se bachav)
  res.json({ message: "If the account exists, an OTP has been sent" });
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !ok) throw new ExpressError(401, "Invalid email or password");

  if (!user.isVerified) {
    try { await issueOtp(email, "signup"); } catch { /* cooldown chal raha ho to ignore */ }
    return res.status(403).json({ message: "Email not verified. We sent you an OTP.", needsVerification: true, email });
  }
  if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");
  sendToken(res, user);
};

module.exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
};

module.exports.me = (req, res) => res.json({ user: publicUser(req.user) });

module.exports.updateProfile = async (req, res) => {
  const { phone } = req.body;
  if (await User.exists({ phone, _id: { $ne: req.user._id } })) {
    throw new ExpressError(409, "Phone number already registered");
  }
  req.user.phone = phone;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isVerified: true });
  if (user) await issueOtp(email, "reset");
  res.json({ message: "If the account exists, an OTP has been sent" });
};

module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, isVerified: true }).select("+password");
  if (!user) throw new ExpressError(400, "Invalid OTP");

  await checkOtp(email, "reset", otp);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated. Please login." });
};

module.exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ExpressError(400, "Google token is required");

  let payload;
  try {
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      payload = jwt.decode(credential);
    }
  } catch (err) {
    console.error("Google verify error:", err.message);
    throw new ExpressError(401, "Google verification failed");
  }

  if (!payload || !payload.email) {
    throw new ExpressError(400, "Invalid Google token payload");
  }

  const email = payload.email.toLowerCase().trim();
  const googleId = payload.sub;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");
    if (!user.googleId) user.googleId = googleId;
    if (!user.isVerified) user.isVerified = true;
    await user.save();
  } else {
    let baseUsername = (payload.name || email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20);
    let username = baseUsername;
    let counter = 1;
    while (await User.exists({ username })) {
      username = `${baseUsername.slice(0, 15)}_${counter++}`;
    }

    user = await User.create({
      username,
      email,
      googleId,
      isVerified: true,
      role: "user",
    });
  }

  sendToken(res, user);
};

