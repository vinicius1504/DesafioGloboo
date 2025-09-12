import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';
import { TaskService } from '../../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../../dto/task.dto';
import { TaskResponseDto, PaginatedTaskResponseDto } from '../../dto/task-response.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { Task, TaskPriority, TaskStatus } from '../../entities/task.entity';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task and return TaskResponseDto', async () => {
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
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResponse: TaskResponseDto = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: undefined,
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        assignedUsers: [],
        comments: [],
        createdAt: mockTask.createdAt,
        updatedAt: mockTask.updatedAt,
      };

      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, userId);

      expect(mockTaskService.create).toHaveBeenCalledWith(createTaskDto, userId);
      expect(result).toEqual(expectedResponse);
    });

    it('should create a task with assigned users and comments', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        assignedUserIds: ['user-456'],
      };
      const userId = 'user-123';
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        assignedUsers: [
          {
            id: 'user-456',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        ],
        comments: [
          {
            id: 'comment-123',
            content: 'Test comment',
            user: {
              id: 'user-789',
              username: 'commenter',
              email: 'commenter@example.com',
              firstName: 'Comment',
              lastName: 'User',
            },
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, userId);

      expect(result.assignedUsers).toHaveLength(1);
      expect(result.comments).toHaveLength(1);
      expect(result.assignedUsers[0].username).toBe('testuser');
      expect(result.comments[0].content).toBe('Test comment');
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const pagination: PaginationDto = { page: 1, size: 10 };
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          assignedUsers: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          assignedUsers: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const paginatedResult = {
        data: mockTasks,
        total: 2,
        page: 1,
        size: 10,
        totalPages: 1,
      };

      mockTaskService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(pagination);

      expect(mockTaskService.findAll).toHaveBeenCalledWith(pagination);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.data[0].title).toBe('Task 1');
      expect(result.data[1].title).toBe('Task 2');
    });

    it('should handle empty results', async () => {
      const pagination: PaginationDto = { page: 1, size: 10 };
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0,
      };

      mockTaskService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(pagination);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        assignedUsers: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId);

      expect(mockTaskService.findOne).toHaveBeenCalledWith(taskId);
      expect(result.id).toBe(taskId);
      expect(result.title).toBe('Test Task');
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('update', () => {
    it('should update a task and return updated TaskResponseDto', async () => {
      const taskId = 'task-123';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.DONE,
      };
      const userId = 'user-456';
      const mockUpdatedTask = {
        id: taskId,
        title: 'Updated Title',
        description: 'Original Description',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.DONE,
        assignedUsers: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.update.mockResolvedValue(mockUpdatedTask);

      const result = await controller.update(taskId, updateTaskDto, userId);

      expect(mockTaskService.update).toHaveBeenCalledWith(taskId, updateTaskDto, userId);
      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(TaskStatus.DONE);
      expect(result.description).toBe('Original Description');
    });

    it('should handle update with assigned users change', async () => {
      const taskId = 'task-123';
      const updateTaskDto: UpdateTaskDto = {
        assignedUserIds: ['user-789', 'user-999'],
      };
      const userId = 'user-456';
      const mockUpdatedTask = {
        id: taskId,
        title: 'Test Task',
        assignedUsers: [
          {
            id: 'user-789',
            username: 'user1',
            email: 'user1@example.com',
            firstName: 'User',
            lastName: 'One',
          },
          {
            id: 'user-999',
            username: 'user2',
            email: 'user2@example.com',
            firstName: 'User',
            lastName: 'Two',
          },
        ],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.update.mockResolvedValue(mockUpdatedTask);

      const result = await controller.update(taskId, updateTaskDto, userId);

      expect(result.assignedUsers).toHaveLength(2);
      expect(result.assignedUsers[0].username).toBe('user1');
      expect(result.assignedUsers[1].username).toBe('user2');
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';

      mockTaskService.remove.mockResolvedValue(undefined);

      await controller.remove(taskId, userId);

      expect(mockTaskService.remove).toHaveBeenCalledWith(taskId, userId);
    });
  });

  describe('mapToResponseDto', () => {
    it('should map task entity to TaskResponseDto correctly', () => {
      const task = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2024-12-31'),
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        assignedUsers: [
          {
            id: 'user-456',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        ],
        comments: [
          {
            id: 'comment-123',
            content: 'Test comment',
            user: {
              id: 'user-789',
              username: 'commenter',
              email: 'commenter@example.com',
              firstName: 'Comment',
              lastName: 'User',
            },
            createdAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = (controller as any).mapToResponseDto(task);

      expect(result.id).toBe('task-123');
      expect(result.title).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.dueDate).toEqual(new Date('2024-12-31'));
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.assignedUsers).toHaveLength(1);
      expect(result.assignedUsers[0].username).toBe('testuser');
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].content).toBe('Test comment');
      expect(result.comments[0].user.username).toBe('commenter');
      expect(result.createdAt).toEqual(new Date('2024-01-01'));
      expect(result.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should handle task with no assigned users or comments', () => {
      const task = {
        id: 'task-123',
        title: 'Simple Task',
        description: null,
        dueDate: null,
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        assignedUsers: null,
        comments: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = (controller as any).mapToResponseDto(task);

      expect(result.assignedUsers).toEqual([]);
      expect(result.comments).toEqual([]);
      expect(result.description).toBeNull();
      expect(result.dueDate).toBeNull();
    });
  });
});