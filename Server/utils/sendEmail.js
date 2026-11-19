const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const TITLES = {
  signup: "Verify Your Email Address",
  reset: "Reset Your Account Password",
  "email-change": "Confirm Your New Email Address",
};

/**
 * Sends a clean, responsive, branded OTP email
 */
const sendOtpEmail = async (to, otp, purpose = "signup") => {
  const title = TITLES[purpose] || "Your Verification Code";

  try {
    const data = await resend.emails.send({
      from: "Wanderlust Support <onboarding@resend.dev>", // Testing ke liye
      to: to,
      subject: `${title} - [${otp}]`,
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
    });

    console.log("OTP email sent successfully:", data.id);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    throw error; // Important: error throw karo taaki upar catch ho sake
  }
};

module.exports = {
  sendOtpEmail,
};