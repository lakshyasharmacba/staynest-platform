# Wanderlust - Interview Preparation & Architecture Guide

Ye guide interviewer ke samne project ko confident and simple words me explain karne ke liye banai gayi hai.

---

## 1. Project Pitch (30-second Elevator Pitch)
> "Wanderlust ek full-stack stay booking platform hai jo MERN stack (React 18 + Express 5 + MongoDB) par bana hai. Isme basic listing CRUD ke alawa real production business logic implement kiya gaya hai: 
> - **Secure Auth**: Nodemailer email OTP verification, bcrypt hashing, and httpOnly cookie sessions (XSS safe).
> - **Real Booking Engine**: Double-booking prevention algorithm, 15-minute hold with automated expiration, server-side dynamic pricing, and Razorpay payment integration with HMAC signature verification & webhooks.
> - **Cancellation & Refund Policy**: Auto full refund if cancelled 2+ days before check-in via Razorpay Refund API.
> - **Role-Based Access Control (RBAC)**: Guest, Host, and Admin roles with moderation features, automated email receipts, and audit logging."

---

## 2. Key Architecture & Features (Interviewer Questions & Simple Answers)

### Q1: Double booking kaise rokte ho? (Concurrency & Date Overlap)
**Answer:**
Jab koi user booking create karta hai:
1. Hum check karte hain: `newIn < oldOut && newOut > oldIn`
2. Sirf `confirmed` bookings hi nahi, balki `pending` bookings jinka **15-minute hold** abhi valid hai (`holdExpiresAt > new Date()`), unhe bhi check karte hain.
3. Agar overlap hai to turant `409 Conflict` return karte hain.
4. Agar payment hone ke baad (edge-case: jab tak hold expire hua aur kisi aur ne book kar liya), to confirmation step par dubara overlap check hota hai. Agar clash hua, to Razorpay API se **automatic refund** ho jata hai.

### Q2: Payment and Security flow kaise kaam karta hai?
**Answer:**
1. **Never trust frontend pricing**: Booking amount frontend se nahi lete, server stay ke nights aur listing price multiply karke Razorpay Order generate karta hai.
2. **Signature verification**: Frontend se Razorpay order ID, payment ID aur signature aane par server `crypto.createHmac('sha256', secret)` se signature verify karta hai using `crypto.timingSafeEqual` (timing attacks se bachne ke liye).
3. **Webhook backup**: Agar user payment karne ke baad browser tab band kar de, to Razorpay ka webhook `payment.captured` event bhejta hai. Webhook confirmation **idempotent** hai (atomic update: sirf `pending` ya `expired` se `confirmed` karega, double email ya double confirm nahi hoga).

### Q3: Authentication aur Session management kaise implement kiya hai?
**Answer:**
- **No localStorage for JWT**: JWT ko `httpOnly`, `SameSite=Lax`, aur `secure` (in prod) cookie me store karte hain. Isse JavaScript se token chori nahi ho sakta (XSS proof).
- **OTP Security**: OTP `crypto.randomInt` se banta hai. Database me plain OTP nahi, balki **HMAC-SHA256 hash** save hota hai. 10 minute expiry (MongoDB TTL index), max 5 attempts, aur 60-second resend cooldown hai.
- **Unverified Users cleanup**: Agar user signup karke OTP verify nahi karta, to partial TTL index 24 ghante me unverified account ko DB se automatically delete kar deta hai.

### Q4: Admin Moderation aur RBAC kaise ensure kiya hai?
**Answer:**
- User model me `role: "user" | "admin"` aur `isBlocked: Boolean` hai.
- Admin public signup API se kabhi nahi ban sakta (sirf database seed script ya command-line CLI tool `npm run make-admin` se banta hai).
- Admin routes par `requireAuth` aur `isAdmin` middleware laga hai.
- Blocked user ka login reject hota hai aur har authenticated API request par account status check hota hai.
- Admin self-block nahi kar sakta aur doosre admins ko block nahi kar sakta.
- Har moderation action (Block, Unblock, Delete Listing) **AuditLog** collection me store hota hai (action, admin ID, target ID, timestamp).

### Q5: Delete Listing me kya safety hai? (Safe Delete)
**Answer:**
- Listing delete karne se pehle check hota hai ki koi upcoming confirmed booking hai ya nahi (`checkOut > new Date()`). Agar hai, to delete block (409 Conflict) ho jata hai.
- Agar koi booking nahi hai, to Cloudinary se image delete hoti hai, uske reviews delete hote hain, aur sabhi users ki wishlist se uska reference pull ho jata hai.

---

## 3. Tech Stack Summary
- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS 3, Axios, Leaflet Map.
- **Backend**: Node.js, Express 5, Mongoose 9.
- **Third-Party Services**: Razorpay (Payments/Refunds/Webhooks), Cloudinary (Images), Nodemailer / Gmail SMTP (Email OTP & Receipts).
