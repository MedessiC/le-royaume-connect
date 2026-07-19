import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import logger from '../utils/logger.js';

export type EmailProvider = 'smtp' | 'sendgrid' | 'brevo';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private provider: EmailProvider;
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER || 'smtp') as EmailProvider;
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.provider) {
      case 'sendgrid':
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        logger.info('SendGrid email provider initialized');
        break;

      case 'brevo':
        if (!process.env.BREVO_API_KEY) {
          throw new Error('BREVO_API_KEY is required for Brevo provider');
        }
        logger.info('Brevo email provider initialized');
        break;

      case 'smtp':
      default:
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        logger.info('SMTP email provider initialized');
    }
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          await this.sendViaSendGrid(payload);
          break;
        case 'brevo':
          await this.sendViaBrevo(payload);
          break;
        case 'smtp':
        default:
          await this.sendViaSMTP(payload);
      }
      logger.info(`Email sent to ${payload.to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${payload.to}:`, error);
      throw error;
    }
  }

  private async sendViaSMTP(payload: EmailPayload): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized');
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@leregnemillenaire.com',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  private async sendViaSendGrid(payload: EmailPayload): Promise<void> {
    await sgMail.send({
      to: payload.to,
      from: process.env.SENDGRID_FROM || 'noreply@leregnemillenaire.com',
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  private async sendViaBrevo(payload: EmailPayload): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: payload.to }],
        sender: {
          name: 'Le Règne Millénaire',
          email: process.env.BREVO_FROM || 'noreply@leregnemillenaire.com',
        },
        subject: payload.subject,
        htmlContent: payload.html,
        textContent: payload.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.statusText}`);
    }
  }
}

export const emailService = new EmailService();
