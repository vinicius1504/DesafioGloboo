import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class TaskResponseDto {
  @ApiProperty({
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
  })
  @Expose()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Implementar sistema de login e registro usando JWT',
  })
  @Expose()
  description: string;

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa',
    example: '2025-09-20T23:59:59.000Z',
  })
  @Expose()
  dueDate?: Date;

  @ApiProperty({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @Expose()
  priority: TaskPriority;

  @ApiProperty({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @Expose()
  status: TaskStatus;

  @ApiProperty({
    description: 'Usuários atribuídos à tarefa',
    type: 'array',
    items: { $ref: '#/components/schemas/UserResponseDto' },
  })
  @Expose()
  @Type(() => UserResponseDto)
  assignedUsers: UserResponseDto[];

  @ApiProperty({
    description: 'Comentários da tarefa',
    type: 'array',
    items: { $ref: '#/components/schemas/CommentResponseDto' },
  })
  @Expose()
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];

  @ApiProperty({
    description: 'Data de criação da tarefa',
    example: '2025-09-15T15:32:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da tarefa',
    example: '2025-09-15T15:32:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'johndoe',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Doe',
  })
  @Expose()
  lastName: string;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'ID único do comentário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Esta tarefa está quase pronta!',
  })
  @Expose()
  content: string;

  @ApiProperty({
    description: 'Usuário que fez o comentário',
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({
    description: 'Data de criação do comentário',
    example: '2025-09-15T15:32:00.000Z',
  })
  @Expose()
  createdAt: Date;
}

export class PaginatedTaskResponseDto {
  @ApiProperty({
    description: 'Lista de tarefas',
    type: [TaskResponseDto],
  })
  @Expose()
  data: TaskResponseDto[];

  @ApiProperty({
    description: 'Total de tarefas',
    example: 100,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Itens por página',
    example: 10,
  })
  @Expose()
  size: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  @Expose()
  totalPages: number;
}