import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';

/**
 * Email Service
 *
 * Handles email sending using NodeMailer with SMTP configuration
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  /**
   * Initialize NodeMailer transporter
   */
  async initialize() {
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      logger.warn('SMTP credentials not configured, email service disabled');
      return;
    }

    this.transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection
    try {
      await this.transporter.verify();
      logger.info('Email service initialized successfully', {
        host: smtpConfig.host,
        port: smtpConfig.port,
      });
    } catch (error: any) {
      logger.error('Failed to verify SMTP connection', { error: error.message });
      this.transporter = null;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not initialized, skipping send');
      return false;
    }

    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || 'noreply@neiro.dev',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Neiro Platform - Test Email',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Neiro Platform Notifications Service.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      text: 'Test email from Neiro Platform Notifications Service',
    });
  }
}

// Singleton instance
export const emailService = new EmailService();
