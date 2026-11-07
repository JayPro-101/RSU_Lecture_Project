import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { EMAIL_SERVICE } from './interfaces/email.interface';
import { SendlibEmailProvider } from './providers/sendlib/sendlib-email.provider';
import { NodemailerEmailProvider } from './providers/nodemailer/nodemailer-email.provider';
import { HttpClientService } from '../common/http/http-client.service';
import { AppConfigService } from '../config/service/app-config.service';

@Global()
@Module({
  providers: [
    MailService,
    SendlibEmailProvider,
    NodemailerEmailProvider,
    HttpClientService,
    AppConfigService,
    {
      provide: EMAIL_SERVICE,
      useExisting: MailService,
    },
  ],
  exports: [
    MailService,
    EMAIL_SERVICE,
    SendlibEmailProvider,
    NodemailerEmailProvider,
    HttpClientService,
    AppConfigService,
  ],
})
export class MailModule {}
