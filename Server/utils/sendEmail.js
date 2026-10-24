const nodemailer = require("nodemailer");

let transporter;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465, // 465 = SSL, baaki (587/2525) = STARTTLS
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const TITLES = {
  signup: "Verify your email",
  reset: "Reset your password",
};

const sendOtpEmail = async (to, otp, purpose) => {
  const title = TITLES[purpose] || "Your OTP";
  await getTransporter().sendMail({
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${title} - Wanderlust`,
    text: `Your Wanderlust OTP is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
        <h2 style="color:#fe424d">Wanderlust</h2>
        <p>${title}. Use this OTP:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:bold">${otp}</p>
        <p>Valid for <b>10 minutes</b>. Do not share it with anyone.</p>
      </div>`,
  });
};

module.exports = {
  getTransporter,
  sendOtpEmail,
};
