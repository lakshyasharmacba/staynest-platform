const nodemailer = require("nodemailer");

let transporter;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    // Strip spaces in case the app password was copied with spaces (e.g. "abcd efgh ijkl mnop")
    const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass,
      },
    });
  }
  return transporter;
};

const TITLES = {
  signup: "Verify Your Email Address",
  reset: "Reset Your Account Password",
};

/**
 * Sends a clean, responsive, branded OTP email for verification or password reset.
 */
const sendOtpEmail = async (to, otp, purpose = "signup") => {
  const title = TITLES[purpose] || "Your Verification Code";
  const user = process.env.EMAIL_USER || "noreply@wanderlust.local";

  const mailOptions = {
    from: `"Wanderlust Support" <${user}>`,
    to,
    subject: `${title} - [${otp}]`,
    text: `Your Wanderlust verification code is: ${otp}. It is valid for 10 minutes. Please do not share this code with anyone.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fe424d; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Wanderlust</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Explore, Book & Experience</p>
        </div>
        
        <div style="border-top: 1px solid #f3f4f6; padding-top: 20px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">${title}</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin: 0 0 20px 0;">
            Use the 6-digit verification code below to complete your ${purpose === "reset" ? "password reset" : "email verification"}.
          </p>
          
          <div style="background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fe424d; font-family: monospace;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">
            ⏳ This code expires in <b>10 minutes</b>.
          </p>
          <p style="font-size: 13px; color: #6b7280; margin: 0;">
            🔒 If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <div style="margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Wanderlust Inc. All rights reserved.
        </div>
      </div>
    `,
  };

  await getTransporter().sendMail(mailOptions);
};

module.exports = {
  getTransporter,
  sendOtpEmail,
};
