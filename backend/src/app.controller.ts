import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponseDto } from './common/dto/api-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<ApiResponseDto<string>> {
    const greeting = await Promise.resolve(this.appService.getHello());
    return ApiResponseDto.success(
      'Welcome to RSU Lecture Information Platform API',
      greeting,
    );
  }
}
