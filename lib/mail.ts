
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Sends an email using SMTP via Nodemailer
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️ SMTP configuration missing. Email not sent.');
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM || `"IMMOCIBLE" <noreply@immocible.com>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(email: string, role: string, name?: string): Promise<boolean> {
  const subject = `Bienvenue sur IMMOCIBLE !`;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Bienvenue chez IMMOCIBLE ${name ? `, ${name}` : ''} !</h1>
      <p>Nous sommes ravis de vous compter parmi nous.</p>
      <p>Votre compte <strong>${role}</strong> a été créé avec succès.</p>
      <p>Vous pouvez dès maintenant accéder à votre tableau de bord et commencer à utiliser nos services.</p>
      <br />
      <p>À bientôt,<br/>L'équipe IMMOCIBLE</p>
    </div>
  `;

  const text = `Bienvenue chez IMMOCIBLE ! Votre compte ${role} a été créé avec succès. Connectez-vous pour commencer.`;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const subject = `Réinitialisation de votre mot de passe IMMOCIBLE`;

  // In a real app, this would link to a real route with the token
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour procéder :</p>
      <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}
