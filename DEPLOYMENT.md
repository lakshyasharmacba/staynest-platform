# Wanderlust - Deployment Guide

## 1. Database (MongoDB Atlas)
1. Free M0 cluster create karein.
2. Network Access -> `0.0.0.0/0` (Allow from anywhere).
3. Database User banayein aur Connection string copy karein.
4. Set as `MONGO_URL` in backend environment variables.

## 2. Backend Deployment (Render)
1. New Web Service -> Connect Git repo (Root Directory: `Server`).
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `8080`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `MONGO_URL`: `mongodb+srv://...`
   - `JWT_SECRET`, `OTP_SECRET`
   - `EMAIL_USER`, `EMAIL_PASS`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

## 3. Frontend Deployment (Vercel)
1. Import project -> Root directory: `Client`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. `vercel.json` already configured to proxy `/api/*` to the backend so cookies work seamlessly.

## 4. Razorpay Webhook Setup
1. Razorpay Dashboard -> Settings -> Webhooks -> Add New Webhook.
2. Webhook URL: `https://your-backend.onrender.com/api/payments/webhook`
3. Secret: Paste same value as `RAZORPAY_WEBHOOK_SECRET`.
4. Active Events:
   - `payment.captured`
   - `order.paid`
