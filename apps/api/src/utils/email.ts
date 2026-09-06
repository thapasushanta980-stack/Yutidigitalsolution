import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Lazily create a transport only if SMTP is configured.
const transporter =
  env.SMTP_HOST && env.SMTP_USER
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: (env.SMTP_PORT ?? 587) === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      })
    : null;

interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Fire-and-forget: email must NEVER block or fail the calling operation
// (e.g. lead creation). Failures are logged, not thrown.
export function sendEmail(mail: Mail): void {
  if (!transporter) {
    logger.info({ to: mail.to, subject: mail.subject }, 'SMTP not configured — email skipped');
    return;
  }
  transporter
    .sendMail({ from: env.MAIL_FROM, ...mail })
    .then(() => logger.info({ to: mail.to }, 'Email sent'))
    .catch((err) => logger.warn({ err }, 'Email send failed (non-blocking)'));
}
