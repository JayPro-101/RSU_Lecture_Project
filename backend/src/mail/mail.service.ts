import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService, EmailPayload } from './interfaces/email.interface';
import { SendlibEmailProvider } from './providers/sendlib/sendlib-email.provider';
import { NodemailerEmailProvider } from './providers/nodemailer/nodemailer-email.provider';
import { EmailTemplates } from './templates/email-template';

@Injectable()
export class MailService implements IEmailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sendlibProvider: SendlibEmailProvider,
    private readonly nodemailerProvider: NodemailerEmailProvider,
  ) {}

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    const provider = this.configService
      .get<string>('EMAIL_PROVIDER', 'sendlib')
      .toLowerCase();

    const htmlContent =
      payload.html ||
      `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0b4f6c;">RSU Lecture Information Platform</h2>
        <p>${payload.text.replace(/\n/g, '<br/>')}</p>
      </div>`;

    if (provider === 'nodemailer' || provider === 'smtp') {
      try {
        await this.nodemailerProvider.send({
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: htmlContent,
        });
        return true;
      } catch (error) {
        this.logger.error(
          `Failed to send email via Nodemailer: ${(error as Error).message}`,
        );
        return false;
      }
    }

    if (provider === 'sendlib') {
      try {
        await this.sendlibProvider.send({
          to: payload.to,
          subject: payload.subject,
          html: htmlContent,
        });
        return true;
      } catch (error) {
        this.logger.error(
          `Failed to send email via Sendlib: ${(error as Error).message}`,
        );
        return false;
      }
    }

    // Default development fallback: console logger
    this.logger.log('--------------------------------------------------');
    this.logger.log(`📧 [DEV EMAIL SIMULATOR (${provider})]`);
    this.logger.log(`To: ${payload.to}`);
    this.logger.log(`Subject: ${payload.subject}`);
    this.logger.log(`Content:\n${payload.text}`);
    this.logger.log('--------------------------------------------------');
    return true;
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    displayName: string,
  ): Promise<boolean> {
    const text = `Hello ${displayName},\n\nWelcome to RSU Lecture Information Platform!\nYour email verification token is: ${token}\n\nUse POST /auth/verify-email with {"token": "${token}"} to activate your account.`;
    const html = EmailTemplates.getVerificationEmail({
      displayName,
      token,
    });

    return this.sendEmail({
      to,
      subject: 'RSU Lecture Platform - Verify Your Email',
      text,
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    displayName: string,
  ): Promise<boolean> {
    const ttlMinutes = Number(
      this.configService.get('PASSWORD_RESET_TOKEN_TTL_MINUTES', 60),
    );
    const text = `Hello ${displayName},\n\nA password reset was requested for your account.\nYour reset token is: ${token}\n\nUse POST /auth/reset-password with {"token": "${token}", "newPassword": "..."} within ${ttlMinutes} minutes.\nIf you did not request this, please ignore this email.`;
    const html = EmailTemplates.getPasswordResetEmail({
      displayName,
      token,
      expiresInMinutes: ttlMinutes,
    });

    return this.sendEmail({
      to,
      subject: 'RSU Lecture Platform - Password Reset Request',
      text,
      html,
    });
  }
}
