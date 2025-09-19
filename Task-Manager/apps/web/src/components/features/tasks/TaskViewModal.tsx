import React from 'react';
import { X, Calendar, User, Clock, Tag, Users } from 'lucide-react';
import { Task, TaskViewModalProps } from '@/types';

const TaskViewModal: React.FC<TaskViewModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

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
        className="px-3 py-1 rounded-lg text-sm font-medium text-white"
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
        className="px-3 py-1 rounded-lg text-sm font-medium text-white"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateAvatar = (name: string) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-4">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {task.title}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Tag className="w-5 h-5" />
            Descrição
          </h3>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-secondary)' }}
            >
              {task.description || 'Sem descrição'}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Due Date */}
          <div>
            <h3
              className="text-lg font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Calendar className="w-5 h-5" />
              Data de Vencimento
            </h3>
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3
              className="text-lg font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Clock className="w-5 h-5" />
              Datas Importantes
            </h3>
            <div
              className="p-4 rounded-lg space-y-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Criado em:
                </span>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatDateTime(task.createdAt)}
                </p>
              </div>
              <div>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Última atualização:
                </span>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatDateTime(task.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Users */}
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Users className="w-5 h-5" />
            Colaboradores Atribuídos ({task.assignedUsers?.length || 0})
          </h3>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
              <div className="space-y-3">
                {task.assignedUsers.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ backgroundColor: generateAvatar(assignee.username) }}
                    >
                      {assignee.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {assignee.username}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {assignee.email}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignee.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assignee.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: 'var(--text-muted)' }}
                />
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Nenhum colaborador atribuído
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;