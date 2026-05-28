import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function fromAddress() {
  const name = process.env.SMTP_FROM_NAME;
  const email = process.env.SMTP_FROM_EMAIL ?? "noreply@example.com";
  return name ? `"${name}" <${email}>` : email;
}

export async function sendVerificationEmail(to: string, url: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] Verification email for ${to}: ${url}`);
    return;
  }

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject: "Verify your email address",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Verify your email address</h2>
        <p>By becoming member you agree to terms and conditions.</p>
        <p>Click the button below to verify your email and complete your registration.</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:4px">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#666;font-size:13px">
          This link expires in 24 hours. If you did not create an account, you can ignore this email.
        </p>
      </div>
    `,
  });
}
