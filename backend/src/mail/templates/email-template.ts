/**
 * RSU Lecture Information Platform - Email Templates
 * Responsive, clean HTML email templates for transactional messages.
 */

export interface VerificationEmailTemplateProps {
  displayName: string;
  token: string;
  verificationUrl?: string;
}

export interface PasswordResetEmailTemplateProps {
  displayName: string;
  token: string;
  resetUrl?: string;
  expiresInMinutes?: number;
}

const baseEmailLayout = (title: string, bodyContent: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f4f6f9;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: #0b4f6c;
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #bfe3f0;
      font-size: 13px;
    }
    .content {
      padding: 32px;
    }
    .token-box {
      background-color: #f0f7fa;
      border: 1px dashed #0b4f6c;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
    }
    .token-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 20px;
      font-weight: 700;
      color: #0b4f6c;
      letter-spacing: 2px;
      word-break: break-all;
    }
    .footer {
      background-color: #fafbfc;
      border-top: 1px solid #eaecef;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #6a737d;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>RSU Lecture Information Platform</h1>
        <p>Rivers State University Real-Time Academic Verification System</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Rivers State University. All rights reserved.</p>
        <p>This is an automated security message. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export class EmailTemplates {
  /**
   * Generates HTML email for account verification.
   */
  static getVerificationEmail(props: VerificationEmailTemplateProps): string {
    const actionUrlMarkup = props.verificationUrl
      ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${props.verificationUrl}" style="background-color: #0b4f6c; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </div>
      `
      : '';

    const content = `
      <h2 style="font-size: 18px; color: #1a202c; margin-top: 0;">Welcome, ${props.displayName}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568;">
        Thank you for creating an account on the <strong>RSU Real-Time Lecture Information Platform</strong>. To activate your account and start receiving verified lecture updates, please verify your email address.
      </p>

      <div class="token-box">
        <div style="font-size: 12px; text-transform: uppercase; color: #4a5568; margin-bottom: 6px; font-weight: 600;">Verification Token</div>
        <div class="token-value">${props.token}</div>
      </div>

      ${actionUrlMarkup}

      <p style="font-size: 14px; line-height: 1.5; color: #718096;">
        Submit this token to <code>POST /auth/verify-email</code> to confirm your email. If you did not create an account, you can safely ignore this email.
      </p>
    `;

    return baseEmailLayout('Verify Your Email - RSU Lecture Platform', content);
  }

  /**
   * Generates HTML email for password recovery.
   */
  static getPasswordResetEmail(props: PasswordResetEmailTemplateProps): string {
    const expiry = props.expiresInMinutes || 60;
    const actionUrlMarkup = props.resetUrl
      ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${props.resetUrl}" style="background-color: #d9381e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
      `
      : '';

    const content = `
      <h2 style="font-size: 18px; color: #1a202c; margin-top: 0;">Password Reset Request</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #4a5568;">
        Hello ${props.displayName}, we received a request to reset the password for your account on the <strong>RSU Real-Time Lecture Information Platform</strong>.
      </p>

      <div class="token-box" style="border-color: #d9381e; background-color: #fff8f6;">
        <div style="font-size: 12px; text-transform: uppercase; color: #d9381e; margin-bottom: 6px; font-weight: 600;">Password Reset Token</div>
        <div class="token-value" style="color: #d9381e;">${props.token}</div>
      </div>

      ${actionUrlMarkup}

      <p style="font-size: 14px; line-height: 1.5; color: #718096;">
        This token is valid for <strong>${expiry} minutes</strong> and can only be used once. If you did not request a password reset, please ignore this email and your password will remain unchanged.
      </p>
    `;

    return baseEmailLayout('Password Reset - RSU Lecture Platform', content);
  }
}
