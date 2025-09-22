import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { TaskResponseDto, PaginatedTaskResponseDto } from '../dto/task-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.create(createTaskDto, userId);
    return this.mapToResponseDto(task);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: PaginatedTaskResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ): Promise<PaginatedTaskResponseDto> {
    const result = await this.taskService.findAll(pagination, userId);
    return {
      ...result,
      data: result.data.map(task => this.mapToResponseDto(task)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.findOne(id, userId);
    return this.mapToResponseDto(task);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.update(id, updateTaskDto, userId);
    return this.mapToResponseDto(task);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.taskService.remove(id, userId);
  }

  private mapToResponseDto(task: any): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedUsers: task.assignedUsers?.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      })) || [],
      comments: task.comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          email: comment.user.email,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
        },
        createdAt: comment.createdAt,
      })) || [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}