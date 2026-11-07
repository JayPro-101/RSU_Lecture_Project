import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return structured ApiResponseDto with greeting', async () => {
      const response = await appController.getHello();
      expect(response.status).toBe('success');
      expect(response.data).toBe('Hello World!');
    });
  });
});
