import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: {
    action: AuditAction;
    taskId: string;
    userId?: string;
    description?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(auditLog);
  }

  async getTaskHistory(taskId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async logTaskCreated(task: Task, userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.createLog({
      action: AuditAction.CREATED,
      taskId: task.id,
      userId,
      description: `Tarefa "${task.title}" foi criada`,
      changes: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      },
      metadata,
    });
  }

  async logTaskUpdated(
    taskId: string,
    userId: string,
    oldValues: Partial<Task>,
    newValues: Partial<Task>,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const changes: Record<string, any> = {};
    const descriptions: string[] = [];

    // Detectar mudanças específicas
    if (oldValues.status !== newValues.status) {
      changes.status = { from: oldValues.status, to: newValues.status };
      descriptions.push(`Status alterado de ${oldValues.status} para ${newValues.status}`);
    }

    if (oldValues.priority !== newValues.priority) {
      changes.priority = { from: oldValues.priority, to: newValues.priority };
      descriptions.push(`Prioridade alterada de ${oldValues.priority} para ${newValues.priority}`);
    }

    if (oldValues.title !== newValues.title) {
      changes.title = { from: oldValues.title, to: newValues.title };
      descriptions.push(`Título alterado`);
    }

    if (oldValues.description !== newValues.description) {
      changes.description = { from: oldValues.description, to: newValues.description };
      descriptions.push(`Descrição alterada`);
    }

    if (oldValues.dueDate !== newValues.dueDate) {
      changes.dueDate = { from: oldValues.dueDate, to: newValues.dueDate };
      descriptions.push(`Data de vencimento alterada`);
    }

    if (Object.keys(changes).length > 0) {
      await this.createLog({
        action: changes.status ? AuditAction.STATUS_CHANGED : AuditAction.UPDATED,
        taskId,
        userId,
        description: descriptions.join(', '),
        changes,
        metadata,
      });
    }
  }

  async logTaskDeleted(taskId: string, userId: string, taskTitle: string, metadata?: Record<string, any>): Promise<void> {
    await this.createLog({
      action: AuditAction.DELETED,
      taskId,
      userId,
      description: `Tarefa "${taskTitle}" foi excluída`,
      metadata,
    });
  }

  async logUserAssigned(taskId: string, assignedUserId: string, assignedByUserId: string, metadata?: Record<string, any>): Promise<void> {
    await this.createLog({
      action: AuditAction.ASSIGNED,
      taskId,
      userId: assignedByUserId,
      description: `Usuário atribuído à tarefa`,
      changes: { assignedUserId },
      metadata,
    });
  }

  async logUserUnassigned(taskId: string, unassignedUserId: string, unassignedByUserId: string, metadata?: Record<string, any>): Promise<void> {
    await this.createLog({
      action: AuditAction.UNASSIGNED,
      taskId,
      userId: unassignedByUserId,
      description: `Usuário removido da tarefa`,
      changes: { unassignedUserId },
      metadata,
    });
  }

  async logCommentAdded(taskId: string, userId: string, commentId: string, metadata?: Record<string, any>): Promise<void> {
    await this.createLog({
      action: AuditAction.COMMENTED,
      taskId,
      userId,
      description: `Comentário adicionado`,
      changes: { commentId },
      metadata,
    });
  }
}