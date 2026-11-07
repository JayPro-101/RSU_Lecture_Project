import { ConfigService } from '@nestjs/config';
import { NodemailerEmailProvider } from './nodemailer-email.provider';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NodemailerEmailProvider', () => {
  let provider: NodemailerEmailProvider;
  let configService: ConfigService;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    configService = {
      get: jest.fn((key: string, defaultVal: any) => defaultVal),
    } as unknown as ConfigService;

    provider = new NodemailerEmailProvider(configService);
  });

  it('should send an email using configured transporter', async () => {
    await provider.send({
      to: 'student@rsu.edu.ng',
      subject: 'Test Subject',
      text: 'Test Body',
      html: '<p>Test Body</p>',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@rsu.edu.ng',
        subject: 'Test Subject',
        text: 'Test Body',
        html: '<p>Test Body</p>',
      }),
    );
  });
});
