import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;

  const mockNotification: Notification = {
    id: 1,
    message: 'Test notification',
    userId: 'user1',
    taskId: 'task1',
    createdAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notificationData = { message: 'Test', userId: 'user1' };
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockReturnValue(mockNotification);

      const result = await service.create(notificationData);

      expect(mockRepository.create).toHaveBeenCalledWith(notificationData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      const notifications = [mockNotification];
      mockRepository.find.mockReturnValue(notifications);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should return a notification by id', async () => {
      mockRepository.findOne.mockReturnValue(mockNotification);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockNotification);
    });

    it('should return null if notification not found', async () => {
      mockRepository.findOne.mockReturnValue(null);

      const result = await service.findOne(999);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });
});