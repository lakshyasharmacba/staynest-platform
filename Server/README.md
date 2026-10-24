# Wanderlust Server (Phase 1) - REST API

Express 5 + MongoDB (Mongoose) + JWT (httpOnly cookie) + Nodemailer OTP + Razorpay (TEST mode)

## Setup
```
npm install
cp .env.example .env     # fill values
npm run seed             # demo listings (host@wanderlust.local / Host12345)
npm run dev              # http://localhost:8080
```

### Gmail App Password (OTP email ke liye)
1. Google Account -> Security -> **2-Step Verification ON**
2. Security -> **App passwords** -> naya password banao
3. 16-letter password `EMAIL_PASS` me daalo (normal Gmail password nahi chalega)

### Razorpay TEST
- Dashboard -> **Test Mode** -> Settings -> API Keys -> `rzp_test_...` key + secret
- Test card: `4111 1111 1111 1111`, any future expiry, any CVV, OTP: `1234` / "Success"
- Webhook (optional): ngrok URL + `/api/payments/webhook`, events `payment.captured`, `order.paid`, secret -> `RAZORPAY_WEBHOOK_SECRET`

## API
| Method | URL | Auth | Kaam |
|---|---|---|---|
| POST | /api/auth/signup | - | username, email, phone, password -> OTP email |
| POST | /api/auth/verify-otp | - | email + 6 digit OTP -> account verified + login |
| POST | /api/auth/resend-otp | - | {email, purpose: signup/reset} (60s gap) |
| POST | /api/auth/login | - | email + password (unverified ho to OTP dobara) |
| POST | /api/auth/logout | - | cookie clear |
| GET/PATCH | /api/auth/me | yes | profile / phone update |
| POST | /api/auth/forgot-password | - | OTP email |
| POST | /api/auth/reset-password | - | email + OTP + newPassword |
| GET | /api/listings | - | ?search&category&minPrice&maxPrice&sort&page&limit |
| GET | /api/listings/:id | - | listing + reviews |
| POST/PUT/DELETE | /api/listings(/:id) | yes (owner) | multipart form, image field = `image` |
| POST | /api/listings/:id/reviews | yes | sirf stay complete hone ke baad |
| DELETE | /api/reviews/:id | yes | sirf apna review |
| POST | /api/listings/:id/bookings | yes | dates + guests -> Razorpay order |
| POST | /api/payments/verify | yes | signature verify -> booking confirmed |
| POST | /api/payments/webhook | Razorpay | backup confirmation (raw body) |
| GET | /api/bookings/mine | yes | meri bookings (confirmed pe host phone) |
| GET | /api/bookings/host | yes | meri listings ki confirmed bookings + revenue |
| PATCH | /api/bookings/:id/cancel | yes | 2+ din pehle = full refund |
| GET | /api/admin/stats | Admin | total users, blocked, listings, revenue, bookings |
| GET | /api/admin/users | Admin | user list + search + pagination |
| PATCH | /api/admin/users/:id/block | Admin | user block/unblock (audit logged) |
| GET | /api/admin/listings | Admin | all listings moderation |
| DELETE | /api/admin/listings/:id | Admin | admin delete listing (safe delete) |
| GET | /api/admin/bookings | Admin | all bookings with status filter |
| GET | /api/admin/logs | Admin | audit log history |

## Make Admin CLI
```bash
npm run make-admin -- someone@example.com
```

## Interview me kya bolna hai (short)
- **OTP**: `crypto.randomInt` (secure), DB me HMAC-SHA256 hash, 10 min expiry (TTL index), 5 attempts, 60s resend gap, ek baar use.
- **Auth & RBAC**: bcrypt hash, JWT httpOnly cookie (XSS safe), email verify bina login nahi. User & Admin roles, `isAdmin` middleware, user block/unblock check on every request.
- **Payment**: amount server calculate karta hai, HMAC signature verify, webhook backup, idempotent confirm.
- **Double booking**: `newIn < oldOut && newOut > oldIn` + 15 min hold (pending) + auto expire.
- **Email Receipts**: Nodemailer se confirm & cancel receipts to both guest and host. Fail-safe (email error never breaks booking flow).
- **Admin Moderation & Audit**: Safe delete (no deletion if active confirmed bookings exist), AuditLog collection stores who did what action and when.
- **Security**: Joi validation, rate limit, helmet, CORS credentials, regex escape in search, HTML escape in emails.
