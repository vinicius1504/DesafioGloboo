import { Expose, Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class TaskResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  dueDate?: Date;

  @Expose()
  priority: TaskPriority;

  @Expose()
  status: TaskStatus;

  @Expose()
  @Type(() => UserResponseDto)
  assignedUsers: UserResponseDto[];

  @Expose()
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  createdAt: Date;
}

export class PaginatedTaskResponseDto {
  @Expose()
  data: TaskResponseDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  size: number;

  @Expose()
  totalPages: number;
}