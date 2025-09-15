import { IsString, IsOptional, IsDateString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Implementar sistema de login e registro usando JWT',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa (formato ISO 8601)',
    example: '2025-09-20T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'IDs dos usuários atribuídos à tarefa',
    type: [String],
    example: ['uuid-do-usuario-1', 'uuid-do-usuario-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedUserIds?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Implementar sistema de login e registro usando JWT',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa (formato ISO 8601)',
    example: '2025-09-20T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'IDs dos usuários atribuídos à tarefa',
    type: [String],
    example: ['uuid-do-usuario-1', 'uuid-do-usuario-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedUserIds?: string[];
}