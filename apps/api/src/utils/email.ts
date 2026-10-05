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
  replyTo?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Build a plain-text + HTML table body for internal "new inquiry" notifications.
// Empty fields are omitted. Visitor-supplied values are HTML-escaped.
export function inquiryBody(title: string, fields: Record<string, string | null | undefined>) {
  const rows = Object.entries(fields).filter(([, v]) => v && String(v).trim()) as [string, string][];
  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  const html =
    `<h2 style="font-family:sans-serif">${esc(title)}</h2>` +
    `<table style="font-family:sans-serif;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${esc(k)}</td>` +
          `<td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join('') +
    `</table>`;
  return { text, html };
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
