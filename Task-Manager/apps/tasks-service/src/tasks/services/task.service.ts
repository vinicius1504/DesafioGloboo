import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto/pagination.dto';
import { CommunicationService } from '../../shared/services/communication.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly communicationService: CommunicationService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { assignedUserIds = [], ...taskData } = createTaskDto;

    // Find assigned users
    const assignedUsers = assignedUserIds.length > 0
      ? await this.userRepository.findByIds(assignedUserIds)
      : [];

    const task = this.taskRepository.create({
      ...taskData,
      assignedUsers,
    });

    const savedTask = await this.taskRepository.save(task);

    // Publish event
    await this.publishTaskEvent('task.created', savedTask.id, {
      task: savedTask,
      createdBy: userId,
    });

    this.logger.log(`Task created: ${savedTask.id} by user ${userId}`);
    return savedTask;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<Task>> {
    const { page = 1, size = 10 } = pagination;
    const skip = (page - 1) * size;

    const [tasks, total] = await this.taskRepository.findAndCount({
      skip,
      take: size,
      relations: ['assignedUsers', 'comments', 'comments.user'],
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / size);

    return {
      data: tasks,
      total,
      page,
      size,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'comments', 'comments.user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);
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

    // Publish event
    await this.publishTaskEvent('task.updated', id, {
      task: updatedTask,
      updatedBy: userId,
      changes: updateTaskDto,
    });

    this.logger.log(`Task updated: ${id} by user ${userId}`);
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);

    this.logger.log(`Task deleted: ${id} by user ${userId}`);
  }

  private async publishTaskEvent(eventType: string, taskId: string, data: any): Promise<void> {
    try {
      if (eventType === 'task.created') {
        await this.communicationService.sendTaskCreated({
          taskId,
          title: data.task.title,
          description: data.task.description,
          status: data.task.status,
          createdBy: data.createdBy,
        });
      } else if (eventType === 'task.updated') {
        await this.communicationService.sendTaskUpdated({
          taskId,
          ...data,
        });
      } else if (eventType === 'task.deleted') {
        await this.communicationService.sendTaskDeleted(taskId);
      }
    } catch (error) {
      this.logger.error(`Failed to publish ${eventType} event for task ${taskId}:`, error);
    }
  }
}