import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('task/:taskId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment on a task' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.create(taskId, createCommentDto, userId);
    return this.mapToResponseDto(comment);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all comments for a task with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [CommentResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async findByTask(
    @Param('taskId') taskId: string,
    @Query() pagination: PaginationDto,
  ): Promise<CommentResponseDto[]> {
    const result = await this.commentService.findByTask(taskId, pagination);
    return result.data.map(comment => this.mapToResponseDto(comment));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    const comment = await this.commentService.findOne(id);
    return this.mapToResponseDto(comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commentService.remove(id, userId);
  }

  private mapToResponseDto(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      task: {
        id: comment.task.id,
        title: comment.task.title,
      },
      user: {
        id: comment.user.id,
        username: comment.user.username,
        email: comment.user.email,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}