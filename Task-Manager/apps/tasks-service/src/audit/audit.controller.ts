import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLogResponseDto } from './dto/audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('tasks/:taskId/history')
  @ApiOperation({
    summary: 'Obter histórico de mudanças de uma tarefa',
    description: 'Retorna o histórico completo de todas as alterações realizadas em uma tarefa específica',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID da tarefa',
    example: 'uuid-da-tarefa',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de mudanças retornado com sucesso',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  async getTaskHistory(@Param('taskId') taskId: string): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.auditService.getTaskHistory(taskId);

    return auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      description: log.description,
      changes: log.changes,
      metadata: log.metadata,
      taskId: log.taskId,
      userId: log.userId,
      createdAt: log.createdAt,
      user: log.user ? {
        id: log.user.id,
        username: log.user.username,
        email: log.user.email,
      } : undefined,
    }));
  }
}