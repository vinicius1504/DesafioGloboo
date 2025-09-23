import React from 'react';
import { Calendar, Edit, Trash2, User, Eye } from 'lucide-react';
import type { TaskCardProps } from '@/types';

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onView }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'TODO': { label: 'A FAZER', color: 'var(--status-todo)' },
      'IN_PROGRESS': { label: 'EM PROGRESSO', color: 'var(--status-progress)' },
      'REVIEW': { label: 'EM REVISÃO', color: 'var(--status-review)' },
      'DONE': { label: 'CONCLUÍDO', color: 'var(--status-done)' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span
        className="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs font-medium text-white"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'LOW': { label: 'BAIXA', color: 'var(--priority-low)' },
      'MEDIUM': { label: 'MÉDIA', color: 'var(--priority-medium)' },
      'HIGH': { label: 'ALTA', color: 'var(--priority-high)' },
      'URGENT': { label: 'URGENTE', color: 'var(--status-urgent)' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];

    return (
      <span
        className="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs font-medium text-white"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const generateAvatar = (name: string) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div
      className="rounded-lg lg:rounded-xl p-4 lg:p-6 task-card-hover cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <h3
          className="text-base lg:text-lg font-semibold line-clamp-2 pr-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-1 lg:p-1.5 rounded-md lg:rounded-lg transition-colors hover:bg-green-50 focus-ring"
            title="Visualizar tarefa"
          >
            <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 lg:p-1.5 rounded-md lg:rounded-lg transition-colors hover:bg-blue-50 focus-ring"
            title="Editar tarefa"
          >
            <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 lg:p-1.5 rounded-md lg:rounded-lg transition-colors hover:bg-red-50 focus-ring"
            title="Excluir tarefa"
          >
            <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2 lg:line-clamp-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {task.description}
      </p>

      {/* Badges */}
      <div className="flex gap-1.5 lg:gap-2 mb-3 lg:mb-4 flex-wrap">
        {getPriorityBadge(task.priority)}
        {getStatusBadge(task.status)}
      </div>

      {/* Footer with Due Date and Assignees */}
      <div className="flex items-center justify-between">
        {/* Due Date - Left side */}
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-xs lg:text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Prazo: {formatDate(task.dueDate)}
          </span>
        </div>

        {/* Assignees - Right side */}
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="flex -space-x-1 lg:-space-x-2">
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
              task.assignedUsers.slice(0, 3).map((assignee) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                  style={{
                    backgroundColor: generateAvatar(assignee.username),
                    borderColor: 'var(--bg-card)'
                  }}
                  title={assignee.username}
                >
                  {assignee.username.charAt(0).toUpperCase()}
                </div>
              ))
            ) : (
              <div
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            {task.assignedUsers && task.assignedUsers.length > 3 && (
              <div
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--text-muted)',
                  borderColor: 'var(--bg-card)',
                  color: 'white'
                }}
              >
                +{task.assignedUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;