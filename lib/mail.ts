
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
  const subject = `Bienvenue sur IMMOCIBLE${name ? `, ${name}` : ''} !`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginPath = role === 'agence' ? '/agence/connexion' : '/acquereur/connexion';
  const loginUrl = `${baseUrl}${loginPath}`;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Bienvenue chez IMMOCIBLE ${name ? `, ${name}` : ''} !</h1>
      <p>Nous sommes ravis de vous compter parmi nous.</p>
      <p>Votre compte <strong>${role}</strong> a été créé avec succès.</p>
      <p>Vous pouvez dès maintenant accéder à votre tableau de bord et commencer à utiliser nos services.</p>
      <div style="margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Se connecter à mon compte
        </a>
      </div>
      <p style="font-size: 0.9em; color: #666;">
        Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br/>
        <a href="${loginUrl}">${loginUrl}</a>
      </p>
      <br />
      <p>À bientôt,<br/>L'équipe IMMOCIBLE</p>
    </div>
  `;

  const text = `Bienvenue chez IMMOCIBLE ! Votre compte ${role} a été créé avec succès. Connectez-vous pour commencer : ${loginUrl}`;

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

/**
 * Sends a payment success email
 */
export async function sendPaymentSuccessEmail(
  email: string,
  amount: number,
  plan: string,
  startDate: Date,
  endDate: Date,
  name?: string
): Promise<boolean> {
  const subject = `Confirmation de paiement${name ? ` - ${name}` : ''} - IMMOCIBLE`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/agence/dashboard`;

  const startStr = startDate.toLocaleDateString();
  const endStr = endDate.toLocaleDateString();
  const planName = plan === 'yearly' ? 'Annuel' : 'Mensuel';

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Paiement reçu avec succès</h1>
      <p>Bonjour ${name || ''},</p>
      <p>Nous vous confirmons la réception de votre paiement de <strong>${amount}€</strong> pour le forfait <strong>${planName}</strong>.</p>
      <p><strong>Période d'abonnement :</strong> du ${startStr} au ${endStr}.</p>
      <p>Votre abonnement est maintenant actif. Vous pouvez accéder à toutes les fonctionnalités de votre dashboard.</p>
      <div style="margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Accéder à mon Dashboard
        </a>
      </div>
      <p>Merci de votre confiance,<br/>L'équipe IMMOCIBLE</p>
    </div>
  `;

  const text = `Paiement reçu de ${amount}€ pour le forfait ${planName}. Période : ${startStr} au ${endStr}. Accéder : ${dashboardUrl}`;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Sends a new message notification
 */
export async function sendNewMessageNotification(
  email: string,
  senderName: string,
  messageContent: string,
  conversationId: string,
  recipientRole: string,
  recipientName?: string
): Promise<boolean> {
  const subject = `${recipientName ? `${recipientName}, ` : ''}Nouveau message de ${senderName}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const messagesPath = recipientRole === 'agence' ? '/agence/messages' : '/acquereur/messages';
  const messageUrl = `${baseUrl}${messagesPath}?conversation=${conversationId}`;

  // Truncate content for privacy/brevity
  const preview = messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Vous avez reçu un nouveau message</h2>
      <p><strong>${senderName}</strong> vous a envoyé un message :</p>
      <blockquote style="border-left: 4px solid #eee; padding-left: 15px; color: #555; font-style: italic;">
        "${preview}"
      </blockquote>
      <div style="margin: 30px 0;">
        <a href="${messageUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Répondre
        </a>
      </div>
      <p style="font-size: 0.9em; color: #666;">
        <a href="${messageUrl}">${messageUrl}</a>
      </p>
    </div>
  `;

  const text = `Nouveau message de ${senderName}: "${preview}". Répondre ici : ${messageUrl}`;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Sends a payment failure email
 */
export async function sendPaymentFailureEmail(email: string, plan: string, name?: string): Promise<boolean> {
  const subject = `Échec du paiement${name ? ` - ${name}` : ''} - IMMOCIBLE`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const settingsUrl = `${baseUrl}/settings`;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Échec du paiement</h1>
      <p>Bonjour ${name || ''},</p>
      <p>Nous n'avons pas pu traiter votre paiement pour le forfait <strong>${plan === 'yearly' ? 'Annuel' : 'Mensuel'}</strong>.</p>
      <p>Ceci est probablement dû à une carte expirée ou à des fonds insuffisants. Merci de mettre à jour vos informations de paiement.</p>
      <div style="margin: 30px 0;">
        <a href="${settingsUrl}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Mettre à jour le paiement
        </a>
      </div>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      <p>L'équipe IMMOCIBLE</p>
    </div>
  `;

  const text = `Échec du paiement pour le forfait ${plan}. Veuillez mettre à jour vos informations de paiement : ${settingsUrl}`;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Sends a subscription ending reminder email
 */
export async function sendSubscriptionReminderEmail(email: string, plan: string, endDate: Date, name?: string): Promise<boolean> {
  const subject = `Rappel : Votre abonnement expire bientôt${name ? ` - ${name}` : ''} - IMMOCIBLE`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const settingsUrl = `${baseUrl}/settings`;
  const dateStr = endDate.toLocaleDateString();

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Rappel d'abonnement</h1>
      <p>Bonjour ${name || ''},</p>
      <p>Votre abonnement <strong>${plan === 'yearly' ? 'Annuel' : 'Mensuel'}</strong> arrivera à expiration le <strong>${dateStr}</strong>.</p>
      <p>Pour continuer à profiter de tous vos avantages sans interruption, pensez à vérifier vos informations de paiement ou à renouveler votre abonnement.</p>
      <div style="margin: 30px 0;">
        <a href="${settingsUrl}" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Gérer mon abonnement
        </a>
      </div>
      <p>Merci de votre fidélité,<br/>L'équipe IMMOCIBLE</p>
    </div>
  `;

  const text = `Rappel : Votre abonnement ${plan} expire le ${dateStr}. Gérer mon abonnement : ${settingsUrl}`;

  return sendEmail({ to: email, subject, html, text });
}
