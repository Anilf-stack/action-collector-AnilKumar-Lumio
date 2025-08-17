// lib/email.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const sender = process.env.SENDER_EMAIL || "no-reply@example.com";

export async function sendEmail(recipients: string[], subject: string, body: string) {
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    // Resend's JS API returns promise; adjust according to their SDK version
    await resend.emails.send({
      from: sender,
      to: recipients,
      subject,
      text: body,
    });
    return;
  }

  // SMTP fallback
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env as any;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("No email provider configured. Set RESEND_API_KEY or SMTP_* vars.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: sender,
    to: recipients.join(","),
    subject,
    text: body,
  });
}
