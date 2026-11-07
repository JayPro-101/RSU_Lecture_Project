export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailService {
  sendEmail(payload: EmailPayload): Promise<boolean>;
  sendVerificationEmail(to: string, token: string, displayName: string): Promise<boolean>;
  sendPasswordResetEmail(to: string, token: string, displayName: string): Promise<boolean>;
}

export const EMAIL_SERVICE = 'EMAIL_SERVICE';
