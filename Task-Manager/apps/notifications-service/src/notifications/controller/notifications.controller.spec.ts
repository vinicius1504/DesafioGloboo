import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotification: Notification = {
    id: 1,
    message: 'Test notification',
    userId: 'user1',
    taskId: 'task1',
    createdAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createDto: CreateNotificationDto = { message: 'Test', userId: 'user1' };
      mockService.create.mockResolvedValue(mockNotification);

      const result = await controller.create(createDto);

      expect(mockService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      const notifications = [mockNotification];
      mockService.findAll.mockResolvedValue(notifications);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should return a notification by id', async () => {
      mockService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNotification);
    });

    it('should return null if notification not found', async () => {
      mockService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(mockService.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});