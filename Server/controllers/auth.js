const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Otp = require("../models/Otp");
const ExpressError = require("../utils/ExpressError");
const { generateOtp, hashOtp, safeEqual } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/sendEmail");

// Google login tabhi on hoga jab asli GOOGLE_CLIENT_ID .env me ho ("your_..." placeholder ignore)
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID;
const googleEnabled = Boolean(GOOGLE_ID) && !GOOGLE_ID.startsWith("your_");
const googleClient = googleEnabled ? new OAuth2Client(GOOGLE_ID) : null;

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

  // OTP console me SIRF development me dikhega. Production logs me OTP aana security hole hai.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] OTP for ${email} (${purpose}): ${otp}`);
  }

  try {
    await sendOtpEmail(email, otp, purpose);
  } catch (err) {
    console.error("Email send failed:", err.message);
    // Mail na gayi to user ko saaf error do (jhoota "OTP sent" nahi) aur record hata do taaki turant dobara try ho sake
    await Otp.deleteOne({ email, purpose });
    throw new ExpressError(502, "Could not send the OTP email. Please check the email address and try again.");
  }
}

// consume=false: sirf check karo, OTP delete mat karo (reset flow me pehle verify, phir password change)
async function checkOtp(email, purpose, otp, consume = true) {
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
  if (consume) await record.deleteOne(); // OTP ek hi baar use ho sakta hai
}

// ---- Controllers ----
module.exports.signup = async (req, res) => {
  let { username, email, phone, password } = req.body;
  username = (username || "").trim();
  email = (email || "").trim().toLowerCase();
  phone = (phone || "").trim();

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
  const email = (req.body.email || "").trim().toLowerCase();
  const otp = (req.body.otp || "").trim();

  const user = await User.findOne({ email });
  if (!user) throw new ExpressError(404, "Account not found. Please sign up again.");
  if (user.isVerified) throw new ExpressError(400, "Email already verified. Please login.");

  await checkOtp(email, "signup", otp);
  user.isVerified = true;
  await user.save();
  sendToken(res, user); // verify hote hi login
};

module.exports.resendOtp = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const purpose = req.body.purpose || "signup";

  const user = await User.findOne({ email });
  const allowed = user && (purpose === "reset" ? user.isVerified : !user.isVerified);
  if (allowed) {
    await issueOtp(email, purpose);
  }
  // User enumeration prevention: always generic success
  res.json({ message: "If the account exists, an OTP has been sent" });
};

module.exports.login = async (req, res) => {
  const rawIdentifier = (req.body.identifier || req.body.email || "").trim();
  const password = req.body.password;

  if (!rawIdentifier || !password) throw new ExpressError(400, "Email/Username and password are required");

  // Email YA username dono se login
  const isEmail = rawIdentifier.includes("@");
  const query = isEmail ? { email: rawIdentifier.toLowerCase() } : { username: rawIdentifier };

  const user = await User.findOne(query).select("+password");

  // Google-only user ka password nahi hota -> bcrypt crash na ho, isliye DUMMY_HASH use karo
  const ok = await bcrypt.compare(password, (user && user.password) || DUMMY_HASH);
  if (!user || !user.password || !ok) throw new ExpressError(401, "Invalid email/username or password");

  if (!user.isVerified) {
    try { await issueOtp(user.email, "signup"); } catch { /* cooldown chal raha ho to ignore */ }
    return res.status(403).json({ message: "Email not verified. We sent you an OTP.", needsVerification: true, email: user.email });
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
  const { username, phone } = req.body; // dono optional (schema.js: .or("username","phone"))

  if (username !== undefined && username !== req.user.username) {
    if (await User.exists({ username, _id: { $ne: req.user._id } })) {
      throw new ExpressError(409, "Username already taken");
    }
    req.user.username = username;
  }

  if (phone !== undefined && phone !== req.user.phone) {
    if (await User.exists({ phone, _id: { $ne: req.user._id } })) {
      throw new ExpressError(409, "Phone number already registered");
    }
    req.user.phone = phone;
  }

  try {
    await req.user.save();
  } catch (err) {
    // Do log ek saath same username/phone le bhale (race) -> MongoDB unique error
    if (err.code === 11000) throw new ExpressError(409, "That username or phone number is already in use");
    throw err;
  }
  res.json({ user: publicUser(req.user) });
};

// Step 1: sirf registered email par OTP jayega
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isVerified: true });
  if (!user) throw new ExpressError(404, "No account found with this email. Please check the email or sign up.");
  if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");
  await issueOtp(email, "reset");
  res.json({ message: "OTP sent to your email", email });
};

// Step 2: OTP sahi hai ya nahi (OTP delete nahi hota, reset-password me dobara use hoga)
module.exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, isVerified: true });
  if (!user) throw new ExpressError(400, "Invalid OTP");
  await checkOtp(email, "reset", otp, false);
  res.json({ message: "OTP verified" });
};

// Step 3: naya password set karo aur seedha login kar do
module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, isVerified: true }).select("+password");
  if (!user) throw new ExpressError(400, "Invalid OTP");
  if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");

  await checkOtp(email, "reset", otp); // yahan OTP delete hota hai
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  sendToken(res, user);
};

module.exports.googleAuth = async (req, res) => {
  // Client id na ho to token bina verify decode ho jata tha (koi bhi fake token bana leta). Ab seedha band.
  if (!googleEnabled) throw new ExpressError(503, "Google login is not configured");

  // Client useGoogleLogin se "accessToken" bhejta hai; "credential" (ID token) bhi chalta hai
  const { credential, accessToken } = req.body;
  if (!credential && !accessToken) throw new ExpressError(400, "Google token is required");

  let payload;
  try {
    if (credential) {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_ID });
      payload = ticket.getPayload();
    } else {
      const info = await googleClient.getTokenInfo(accessToken);
      if (info.aud !== GOOGLE_ID) throw new Error("Token was issued for another app");
      payload = {
        sub: info.sub || info.user_id,
        email: info.email,
        email_verified: info.email_verified === true || info.email_verified === "true",
      };
    }
  } catch (err) {
    console.error("Google verify error:", err.message);
    throw new ExpressError(401, "Google verification failed");
  }

  // Google ne khud email verify kiya ho tabhi aage badho
  if (!payload || !payload.email || !payload.email_verified) {
    throw new ExpressError(400, "Your Google email is not verified");
  }

  const email = payload.email.toLowerCase().trim();
  const googleId = payload.sub;

  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select("+password");

  if (user) {
    if (user.isBlocked) throw new ExpressError(403, "Your account has been blocked by an admin");
    if (!user.googleId) user.googleId = googleId;
    if (!user.isVerified) {
      // Kisi ne pehle tumhari email se adhura signup kiya tha? Uska password/phone hata do,
      // warna wo baad me us password se tumhare account me ghus sakta hai.
      user.isVerified = true;
      user.password = undefined;
      user.phone = undefined;
    }
    await user.save();
  } else {
    // Username: sirf letters/numbers/underscore, kam se kam 3 characters
    let baseUsername = (payload.name || email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20);
    if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
    let username = baseUsername;
    let counter = 1;
    while (await User.exists({ username })) {
      username = `${baseUsername.slice(0, 15)}_${counter++}`;
    }

    user = await User.create({ username, email, googleId, isVerified: true, role: "user" });
  }

  sendToken(res, user);
};