import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { CreateCommentDto } from '../dto/comment.dto';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto/pagination.dto';
import { RabbitMQService } from '../../shared/services/rabbitmq.service';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(taskId: string, createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      userId,
      task,
      user,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Publish event
    try {
      await this.rabbitMQService.publishTaskEvent({
        eventType: 'comment.created',
        taskId,
        data: {
          comment: savedComment,
          task,
          user,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to publish comment.created event for task ${taskId}:`, error);
    }

    this.logger.log(`Comment created: ${savedComment.id} on task ${taskId} by user ${userId}`);
    return savedComment;
  }

  async findByTask(taskId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<Comment>> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const { page = 1, size = 10 } = pagination;
    const skip = (page - 1) * size;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      skip,
      take: size,
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const totalPages = Math.ceil(total / size);

    return {
      data: comments,
      total,
      page,
      size,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['task', 'user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user owns the comment
    if (comment.userId !== userId) {
      throw new NotFoundException('Comment not found or access denied');
    }

    await this.commentRepository.remove(comment);

    this.logger.log(`Comment deleted: ${id} by user ${userId}`);
  }
}