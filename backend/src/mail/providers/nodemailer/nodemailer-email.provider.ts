import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface NodemailerEmail {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class NodemailerEmailProvider {
  private readonly logger = new Logger(NodemailerEmailProvider.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST', 'localhost');
    const port = Number(this.configService.get<number>('SMTP_PORT', 1025));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });

    this.logger.log(`Nodemailer provider initialized (host: ${host}:${port})`);
  }

  async send(email: NodemailerEmail): Promise<void> {
    if (!this.transporter) {
      this.initTransporter();
    }

    const from =
      this.configService.get<string>('EMAIL_FROM') ||
      'RSU Lecture Platform <no-reply@rsu.edu.ng>';

    const info = await this.transporter!.sendMail({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    this.logger.log(`Email sent via Nodemailer to ${email.to} (id: ${info.messageId})`);
  }
}
