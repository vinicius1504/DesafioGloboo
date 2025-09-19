import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() createTaskDto: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.createTask(createTaskDto, authHeader);
  }

  @Get()
  async getAllTasks(
    @Query() pagination: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.getAllTasks(pagination, authHeader);
  }

  @Get(':id')
  async getTaskById(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.getTaskById(id, authHeader);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.updateTask(id, updateTaskDto, authHeader);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.deleteTask(id, authHeader);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.createComment(taskId, createCommentDto, authHeader);
  }

  @Get(':id/comments')
  async getCommentsByTask(
    @Param('id') taskId: string,
    @Query() pagination: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.tasksService.getCommentsByTask(taskId, pagination, authHeader);
  }
}