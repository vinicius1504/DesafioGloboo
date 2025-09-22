import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto/pagination.dto';
import { RabbitMQService } from '../../shared/services/rabbitmq.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { assignedUserIds = [], ...taskData } = createTaskDto;

    // Find assigned users
    const assignedUsers = assignedUserIds.length > 0
      ? await this.userRepository.findByIds(assignedUserIds)
      : [];

    const task = this.taskRepository.create({
      ...taskData,
      createdBy: userId,
      assignedUsers,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log audit
    await this.auditService.logTaskCreated(savedTask, userId);

    // Publish task created event
    try {
      await this.rabbitMQService.publishTaskEvent({
        eventType: 'task.created',
        taskId: savedTask.id,
        data: {
          task: savedTask,
          createdBy: userId,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to publish task created event for task ${savedTask.id}:`, error);
      // Don't fail the task creation if event publishing fails
    }

    this.logger.log(`Task created: ${savedTask.id} by user ${userId}`);
    return savedTask;
  }

  async findAll(pagination: PaginationDto, userId: string): Promise<PaginatedResponseDto<Task>> {
    const { page = 1, size = 10 } = pagination;
    const skip = (page - 1) * size;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.createdBy = :userId', { userId })
      .orWhere('assignedUsers.id = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .skip(skip)
      .take(size);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / size);

    return {
      data: tasks,
      total,
      page,
      size,
      totalPages,
    };
  }

  async findOne(id: string, userId?: string): Promise<Task> {
    let queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.id = :id', { id });

    if (userId) {
      queryBuilder = queryBuilder.andWhere(
        '(task.createdBy = :userId OR assignedUsers.id = :userId)',
        { userId }
      );
    }

    const task = await queryBuilder.getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    const oldValues = { ...task };
    const { assignedUserIds, ...updateData } = updateTaskDto;

    // Update assigned users if provided
    if (assignedUserIds !== undefined) {
      const assignedUsers = assignedUserIds.length > 0
        ? await this.userRepository.findByIds(assignedUserIds)
        : [];
      task.assignedUsers = assignedUsers;
    }

    // Update other fields
    Object.assign(task, updateData);

    const updatedTask = await this.taskRepository.save(task);

    // Log audit
    await this.auditService.logTaskUpdated(id, userId, oldValues, updatedTask);

    // Publish task updated event
    await this.rabbitMQService.publishTaskEvent({
      eventType: 'task.updated',
      taskId: id,
      data: {
        task: updatedTask,
        updatedBy: userId,
        changes: updateTaskDto,
      },
      timestamp: new Date(),
    });

    this.logger.log(`Task updated: ${id} by user ${userId}`);
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    const taskTitle = task.title;

    // Log audit before deletion
    await this.auditService.logTaskDeleted(id, userId, taskTitle);

    await this.taskRepository.remove(task);

    // Publish task deleted event
    await this.rabbitMQService.publishTaskEvent({
      eventType: 'task.deleted',
      taskId: id,
      data: {
        deletedBy: userId,
      },
      timestamp: new Date(),
    });

    this.logger.log(`Task deleted: ${id} by user ${userId}`);
  }
}