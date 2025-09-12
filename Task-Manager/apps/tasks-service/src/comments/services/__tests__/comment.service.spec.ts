import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentService } from '../comment.service';
import { Comment } from '../../entities/comment.entity';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/entities/user.entity';
import { CreateCommentDto } from '../../dto/comment.dto';
import { RabbitMQService } from '../../../shared/services/rabbitmq.service';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;
  let rabbitMQService: RabbitMQService;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRabbitMQService = {
    publishTaskEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
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

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const taskId = 'task-123';
      const createCommentDto: CreateCommentDto = {
        content: 'This is a test comment',
      };
      const userId = 'user-456';
      const mockTask = { id: taskId, title: 'Test Task' };
      const mockUser = { id: userId, username: 'testuser' };
      const mockComment = {
        id: 'comment-123',
        content: 'This is a test comment',
        taskId,
        userId,
        task: mockTask,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);
      mockRabbitMQService.publishTaskEvent.mockResolvedValue(true);

      const result = await service.create(taskId, createCommentDto, userId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        ...createCommentDto,
        taskId,
        userId,
        task: mockTask,
        user: mockUser,
      });
      expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);
      expect(mockRabbitMQService.publishTaskEvent).toHaveBeenCalledWith({
        eventType: 'comment.created',
        taskId,
        data: {
          comment: mockComment,
          task: mockTask,
          user: mockUser,
        },
        timestamp: expect.any(Date),
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const taskId = 'non-existent-task';
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const userId = 'user-456';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.create(taskId, createCommentDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const taskId = 'task-123';
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const userId = 'non-existent-user';
      const mockTask = { id: taskId, title: 'Test Task' };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(taskId, createCommentDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockCommentRepository.create).not.toHaveBeenCalled();
    });

    it('should handle RabbitMQ publish error gracefully', async () => {
      const taskId = 'task-123';
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const userId = 'user-456';
      const mockTask = { id: taskId, title: 'Test Task' };
      const mockUser = { id: userId, username: 'testuser' };
      const mockComment = {
        id: 'comment-123',
        content: 'Test comment',
        taskId,
        userId,
        task: mockTask,
        user: mockUser,
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);
      mockRabbitMQService.publishTaskEvent.mockRejectedValue(new Error('RabbitMQ error'));

      const result = await service.create(taskId, createCommentDto, userId);

      expect(result).toEqual(mockComment);
      expect(mockRabbitMQService.publishTaskEvent).toHaveBeenCalled();
    });
  });

  describe('findByTask', () => {
    it('should return paginated comments for a task', async () => {
      const taskId = 'task-123';
      const pagination = { page: 1, size: 5 };
      const mockTask = { id: taskId, title: 'Test Task' };
      const mockComments = [
        {
          id: 'comment-1',
          content: 'Comment 1',
          user: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'comment-2',
          content: 'Comment 2',
          user: { id: 'user-2', username: 'user2' },
        },
      ];
      const total = 7;

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockCommentRepository.findAndCount.mockResolvedValue([mockComments, total]);

      const result = await service.findByTask(taskId, pagination);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockCommentRepository.findAndCount).toHaveBeenCalledWith({
        where: { taskId },
        skip: 0,
        take: 5,
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual({
        data: mockComments,
        total: 7,
        page: 1,
        size: 5,
        totalPages: 2, // Math.ceil(7/5) = 2
      });
    });

    it('should use default pagination values', async () => {
      const taskId = 'task-123';
      const pagination = {};
      const mockTask = { id: taskId, title: 'Test Task' };
      const mockComments = [];
      const total = 0;

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockCommentRepository.findAndCount.mockResolvedValue([mockComments, total]);

      const result = await service.findByTask(taskId, pagination);

      expect(mockCommentRepository.findAndCount).toHaveBeenCalledWith({
        where: { taskId },
        skip: 0,
        take: 10,
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual({
        data: mockComments,
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0,
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const taskId = 'non-existent-task';
      const pagination = { page: 1, size: 10 };

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findByTask(taskId, pagination)).rejects.toThrow(NotFoundException);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockCommentRepository.findAndCount).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a comment when found', async () => {
      const commentId = 'comment-123';
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        task: { id: 'task-123', title: 'Test Task' },
        user: { id: 'user-456', username: 'testuser' },
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(commentId);

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['task', 'user'],
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      const commentId = 'non-existent-comment';

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(commentId)).rejects.toThrow(NotFoundException);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['task', 'user'],
      });
    });
  });

  describe('remove', () => {
    it('should remove a comment successfully when user owns it', async () => {
      const commentId = 'comment-123';
      const userId = 'user-456';
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        userId: 'user-456',
        task: { id: 'task-123' },
        user: { id: 'user-456' },
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.remove.mockResolvedValue(mockComment);

      await service.remove(commentId, userId);

      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['task', 'user'],
      });
      expect(mockCommentRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      const commentId = 'non-existent-comment';
      const userId = 'user-456';

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(commentId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the comment', async () => {
      const commentId = 'comment-123';
      const userId = 'user-456';
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        userId: 'different-user', // Different user owns the comment
        task: { id: 'task-123' },
        user: { id: 'different-user' },
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      await expect(service.remove(commentId, userId)).rejects.toThrow(NotFoundException);
      expect(mockCommentRepository.remove).not.toHaveBeenCalled();
    });
  });
});