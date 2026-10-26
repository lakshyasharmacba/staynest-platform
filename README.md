# Wanderlust: Stay Booking Platform

Airbnb-style full-stack project. React 18 + Vite + Tailwind | Node + Express 5 | MongoDB | Razorpay (TEST) | Cloudinary | Nodemailer

## Features
Email OTP signup/login (+ optional Google Sign-In), forgot password, listings CRUD with image upload,
search/filter/pagination, map, date booking with double-booking protection, Razorpay test payment + webhook,
cancel + refund, reviews after stay, wishlist, host dashboard, admin panel (block users, moderation, audit log), email receipts.

## Run locally
```bash
cd Server && npm install && cp .env.example .env   # .env me apni keys bharo (kabhi commit mat karo)
npm run seed && npm run dev                        # http://localhost:8080
cd ../Client && npm install && npm run dev         # http://localhost:5173
```
Demo (after seed): host@wanderlust.local / Host12345, admin@wanderlust.local / Admin12345
Razorpay test card: 4111 1111 1111 1111, any future expiry, any CVV, OTP 1234

## Deploy
Atlas (DB) + Render (Server) + Vercel (Client). `Client/vercel.json` me apna Render URL daalo.
Render free pe Gmail SMTP block hota hai, isliye SMTP_HOST/SMTP_PORT (port 2525) wala provider use karo.

## Make admin
`npm run make-admin -- someone@example.com`