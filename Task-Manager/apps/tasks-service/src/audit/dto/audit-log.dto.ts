import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'ID único do log de auditoria',
    example: 'uuid-do-audit-log',
  })
  id: string;

  @ApiProperty({
    description: 'Ação realizada',
    enum: AuditAction,
    example: AuditAction.STATUS_CHANGED,
  })
  action: AuditAction;

  @ApiPropertyOptional({
    description: 'Descrição da ação',
    example: 'Status alterado de TODO para IN_PROGRESS',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Mudanças realizadas',
    example: { status: { from: 'TODO', to: 'IN_PROGRESS' } },
  })
  changes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Metadados adicionais',
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'ID da tarefa relacionada',
    example: 'uuid-da-tarefa',
  })
  taskId: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que realizou a ação',
    example: 'uuid-do-usuario',
  })
  userId?: string;

  @ApiProperty({
    description: 'Data e hora da ação',
    example: '2025-09-22T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Dados do usuário que realizou a ação',
  })
  user?: {
    id: string;
    username: string;
    email: string;
  };
}