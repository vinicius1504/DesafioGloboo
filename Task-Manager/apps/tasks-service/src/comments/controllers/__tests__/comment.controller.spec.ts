import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../comment.controller';
import { CommentService } from '../../services/comment.service';
import { CreateCommentDto } from '../../dto/comment.dto';
import { CommentResponseDto } from '../../dto/comment-response.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: CommentService;

  const mockCommentService = {
    create: jest.fn(),
    findByTask: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment and return CommentResponseDto', async () => {
      const taskId = 'task-123';
      const createCommentDto: CreateCommentDto = {
        content: 'This is a test comment',
      };
      const userId = 'user-456';
      const mockComment = {
        id: 'comment-123',
        content: 'This is a test comment',
        task: {
          id: taskId,
          title: 'Test Task',
        },
        user: {
          id: userId,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResponse: CommentResponseDto = {
        id: 'comment-123',
        content: 'This is a test comment',
        task: {
          id: taskId,
          title: 'Test Task',
        },
        user: {
          id: userId,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        createdAt: mockComment.createdAt,
        updatedAt: mockComment.updatedAt,
      };

      mockCommentService.create.mockResolvedValue(mockComment);

      const result = await controller.create(taskId, createCommentDto, userId);

      expect(mockCommentService.create).toHaveBeenCalledWith(taskId, createCommentDto, userId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByTask', () => {
    it('should return paginated comments for a task', async () => {
      const taskId = 'task-123';
      const pagination: PaginationDto = { page: 1, size: 10 };
      const mockComments = [
        {
          id: 'comment-1',
          content: 'First comment',
          task: { id: taskId, title: 'Test Task' },
          user: {
            id: 'user-1',
            username: 'user1',
            email: 'user1@example.com',
            firstName: 'User',
            lastName: 'One',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-2',
          content: 'Second comment',
          task: { id: taskId, title: 'Test Task' },
          user: {
            id: 'user-2',
            username: 'user2',
            email: 'user2@example.com',
            firstName: 'User',
            lastName: 'Two',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const paginatedResult = {
        data: mockComments,
        total: 2,
        page: 1,
        size: 10,
        totalPages: 1,
      };

      mockCommentService.findByTask.mockResolvedValue(paginatedResult);

      const result = await controller.findByTask(taskId, pagination);

      expect(mockCommentService.findByTask).toHaveBeenCalledWith(taskId, pagination);
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('First comment');
      expect(result[1].content).toBe('Second comment');
      expect(result[0].task.title).toBe('Test Task');
      expect(result[1].user.username).toBe('user2');
    });

    it('should handle empty results', async () => {
      const taskId = 'task-123';
      const pagination: PaginationDto = { page: 1, size: 10 };
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0,
      };

      mockCommentService.findByTask.mockResolvedValue(paginatedResult);

      const result = await controller.findByTask(taskId, pagination);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single comment', async () => {
      const commentId = 'comment-123';
      const mockComment = {
        id: commentId,
        content: 'Test comment content',
        task: {
          id: 'task-456',
          title: 'Related Task',
        },
        user: {
          id: 'user-789',
          username: 'commenter',
          email: 'commenter@example.com',
          firstName: 'Comment',
          lastName: 'User',
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockCommentService.findOne.mockResolvedValue(mockComment);

      const result = await controller.findOne(commentId);

      expect(mockCommentService.findOne).toHaveBeenCalledWith(commentId);
      expect(result.id).toBe(commentId);
      expect(result.content).toBe('Test comment content');
      expect(result.task.id).toBe('task-456');
      expect(result.user.username).toBe('commenter');
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const commentId = 'comment-123';
      const userId = 'user-456';

      mockCommentService.remove.mockResolvedValue(undefined);

      await controller.remove(commentId, userId);

      expect(mockCommentService.remove).toHaveBeenCalledWith(commentId, userId);
    });
  });

  describe('mapToResponseDto', () => {
    it('should map comment entity to CommentResponseDto correctly', () => {
      const comment = {
        id: 'comment-123',
        content: 'Test comment content',
        task: {
          id: 'task-456',
          title: 'Test Task Title',
        },
        user: {
          id: 'user-789',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      const result = (controller as any).mapToResponseDto(comment);

      expect(result.id).toBe('comment-123');
      expect(result.content).toBe('Test comment content');
      expect(result.task).toEqual({
        id: 'task-456',
        title: 'Test Task Title',
      });
      expect(result.user).toEqual({
        id: 'user-789',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2024-01-01T10:00:00Z'));
    });

    it('should handle comment with minimal data', () => {
      const comment = {
        id: 'comment-123',
        content: 'Simple comment',
        task: {
          id: 'task-456',
          title: 'Task',
        },
        user: {
          id: 'user-789',
          username: 'user',
          email: 'user@example.com',
          firstName: null,
          lastName: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = (controller as any).mapToResponseDto(comment);

      expect(result.content).toBe('Simple comment');
      expect(result.user.firstName).toBeNull();
      expect(result.user.lastName).toBeNull();
    });
  });
});