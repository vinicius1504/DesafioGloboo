import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../controller/notifications.controller';
import { NotificationsService } from '../services/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [NotificationsService],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Adicione mais testes conforme implementar endpoints no controller
});