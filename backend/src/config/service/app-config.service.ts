import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get<T = any>(key: string): T {
    // Supports nested path notation like 'sendlib.apiKey' or flat environment variable notation
    if (key === 'sendlib.apiKey') {
      return (this.configService.get<string>('SEND_LIB_API_KEY') ||
        this.configService.get<string>('SENDLIB_API_KEY') ||
        this.configService.get<string>('sendlib.apiKey')) as unknown as T;
    }
    if (key === 'sendlib.from') {
      return (this.configService.get<string>('SEND_LIB_FROM') ||
        this.configService.get<string>('SENDLIB_FROM') ||
        this.configService.get<string>('EMAIL_FROM') ||
        'RSU Lecture Platform <no-reply@rsu.edu.ng>') as unknown as T;
    }
    return this.configService.get<T>(key) as T;
  }
}
