import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from '../task.service';
import { Task, TaskPriority, TaskStatus } from '../../entities/task.entity';
import { User } from '../../../users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from '../../dto/task.dto';
import { RabbitMQService } from '../../../shared/services/rabbitmq.service';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;
  let rabbitMQService: RabbitMQService;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findByIds: jest.fn(),
  };

  const mockRabbitMQService = {
    publishTaskEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task without assigned users', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
      };
      const userId = 'user-123';
      const mockTask = {
        id: 'task-123',
        ...createTaskDto,
        assignedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByIds.mockResolvedValue([]);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.create(createTaskDto, userId);

      expect(mockUserRepository.findByIds).not.toHaveBeenCalled();
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        assignedUsers: [],
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(mockRabbitMQService.publishTaskEvent).toHaveBeenCalledWith({
        eventType: 'task.created',
        taskId: 'task-123',
        data: {
          task: mockTask,
          createdBy: userId,
        },
        timestamp: expect.any(Date),
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task with assigned users', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        assignedUserIds: ['user-456', 'user-789'],
      };
      const userId = 'user-123';
      const mockUsers = [
        { id: 'user-456', username: 'user1' },
        { id: 'user-789', username: 'user2' },
      ];
      const mockTask = {
        id: 'task-123',
        ...createTaskDto,
        assignedUsers: mockUsers,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByIds.mockResolvedValue(mockUsers);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.create(createTaskDto, userId);

      expect(mockUserRepository.findByIds).toHaveBeenCalledWith(['user-456', 'user-789']);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        assignedUsers: mockUsers,
      });
      expect(result).toEqual(mockTask);
    });

    it('should handle RabbitMQ publish error gracefully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
      };
      const userId = 'user-123';
      const mockTask = {
        id: 'task-123',
        ...createTaskDto,
        assignedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByIds.mockResolvedValue([]);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockRabbitMQService.publishTaskEvent.mockRejectedValue(new Error('RabbitMQ error'));

      const result = await service.create(createTaskDto, userId);

      expect(result).toEqual(mockTask);
      expect(mockRabbitMQService.publishTaskEvent).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const pagination = { page: 2, size: 5 };
      const mockTasks = [
        { id: 'task-1', title: 'Task 1' },
        { id: 'task-2', title: 'Task 2' },
      ];
      const total = 12;

      mockTaskRepository.findAndCount.mockResolvedValue([mockTasks, total]);

      const result = await service.findAll(pagination);

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5, // (page-1) * size = 5
        take: 5,
        relations: ['assignedUsers', 'comments', 'comments.user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockTasks,
        total: 12,
        page: 2,
        size: 5,
        totalPages: 3, // Math.ceil(12/5) = 3
      });
    });

    it('should use default pagination values', async () => {
      const pagination = {};
      const mockTasks = [];
      const total = 0;

      mockTaskRepository.findAndCount.mockResolvedValue([mockTasks, total]);

      const result = await service.findAll(pagination);

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['assignedUsers', 'comments', 'comments.user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockTasks,
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task when found', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        assignedUsers: [],
        comments: [],
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedUsers', 'comments', 'comments.user'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent-task';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedUsers', 'comments', 'comments.user'],
      });
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
        assignedUserIds: ['user-789'],
      };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        status: TaskStatus.TODO,
        assignedUsers: [],
        comments: [],
      };
      const mockUsers = [{ id: 'user-789', username: 'user3' }];
      const updatedTask = {
        ...existingTask,
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
        assignedUsers: mockUsers,
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockUserRepository.findByIds.mockResolvedValue(mockUsers);
      mockTaskRepository.save.mockResolvedValue(updatedTask);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.update(taskId, updateTaskDto, userId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedUsers', 'comments', 'comments.user'],
      });
      expect(mockUserRepository.findByIds).toHaveBeenCalledWith(['user-789']);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(existingTask);
      expect(mockRabbitMQService.publishTaskEvent).toHaveBeenCalledWith({
        eventType: 'task.updated',
        taskId,
        data: {
          task: updatedTask,
          updatedBy: userId,
          changes: updateTaskDto,
        },
        timestamp: expect.any(Date),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should update task without changing assigned users when assignedUserIds is undefined', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
      };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        assignedUsers: [{ id: 'user-789' }],
      };
      const updatedTask = {
        ...existingTask,
        title: 'Updated Title',
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.update(taskId, updateTaskDto, userId);

      expect(mockUserRepository.findByIds).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should clear assigned users when assignedUserIds is empty array', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';
      const updateTaskDto: UpdateTaskDto = {
        assignedUserIds: [],
      };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        assignedUsers: [{ id: 'user-789' }],
      };
      const updatedTask = {
        ...existingTask,
        assignedUsers: [],
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockUserRepository.findByIds.mockResolvedValue([]);
      mockTaskRepository.save.mockResolvedValue(updatedTask);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.update(taskId, updateTaskDto, userId);

      expect(mockUserRepository.findByIds).not.toHaveBeenCalled();
      expect(result.assignedUsers).toEqual([]);
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      const taskId = 'non-existent-task';
      const updateTaskDto: UpdateTaskDto = { title: 'New Title' };
      const userId = 'user-456';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a task successfully', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';
      const mockTask = {
        id: taskId,
        title: 'Test Task',
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);

      await service.remove(taskId, userId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedUsers', 'comments', 'comments.user'],
      });
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException when removing non-existent task', async () => {
      const taskId = 'non-existent-task';
      const userId = 'user-456';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});