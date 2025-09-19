import React from 'react';
import { Calendar, Edit, Trash2, User, Eye } from 'lucide-react';
import { Task, TaskCardProps } from '@/types';

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
        className="px-2 py-1 rounded-md text-xs font-medium text-white"
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
        className="px-2 py-1 rounded-md text-xs font-medium text-white"
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
      className="rounded-xl p-6 task-card-hover cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3
          className="text-lg font-semibold line-clamp-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-green-50 focus-ring"
            title="Visualizar tarefa"
          >
            <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-blue-50 focus-ring"
            title="Editar tarefa"
          >
            <Edit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-50 focus-ring"
            title="Excluir tarefa"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-4 line-clamp-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {task.description}
      </p>

      {/* Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {getPriorityBadge(task.priority)}
        {getStatusBadge(task.status)}
      </div>

      {/* Assignees */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {task.assignedUsers && task.assignedUsers.length > 0 ? (
            task.assignedUsers.slice(0, 3).map((assignee) => (
              <div
                key={assignee.id}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
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
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          {task.assignedUsers && task.assignedUsers.length > 3 && (
            <div
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold"
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

      {/* Due Date */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <span
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Prazo: {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;