import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: options.from || process.env.FROM_EMAIL || "noreply@restaurant.com",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendVerificationEmail = async (to: string, verifyUrl: string): Promise<void> => {
  await sendEmail({
    to,
    subject: "Verify Your Email Address",
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: system-ui, sans-serif; color: #0f172a;">
        <div style="padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700;">Verify your email</h2>
          <p style="margin: 0 0 24px; color: #475569; line-height: 1.6;">
            Thanks for signing up! Click the button below to verify your email address. This link expires in 24 hours.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Verify Email
          </a>
          <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  await sendEmail({
    to,
    subject: "Reset Your Password",
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: system-ui, sans-serif; color: #0f172a;">
        <div style="padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700;">Reset your password</h2>
          <p style="margin: 0 0 24px; color: #475569; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
          <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};