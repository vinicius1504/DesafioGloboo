import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import type { Task } from '@/types';

interface TableViewProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TableView: React.FC<TableViewProps> = ({
  tasks,
  onView,
  onEdit,
  onDelete
}) => {
  const statusDisplayMap = {
    'TODO': 'A Fazer',
    'IN_PROGRESS': 'Em Progresso',
    'REVIEW': 'Em Revisão',
    'DONE': 'Concluído'
  };

  const priorityDisplayMap = {
    'LOW': 'Baixa',
    'MEDIUM': 'Média',
    'HIGH': 'Alta',
    'URGENT': 'Urgente'
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'TODO': 'var(--status-todo)',
      'IN_PROGRESS': 'var(--status-progress)',
      'REVIEW': 'var(--status-review)',
      'DONE': 'var(--priority-low)'
    };
    return colors[status] || 'var(--text-muted)';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'var(--priority-low)',
      'MEDIUM': 'var(--priority-medium)',
      'HIGH': 'var(--priority-high)',
      'URGENT': 'var(--status-urgent)'
    };
    return colors[priority] || 'var(--text-muted)';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-lg sm:rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
    >
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 border-b last:border-b-0"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {task.title}
              </h3>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onView(task)}
                  className="p-1 rounded-md transition-colors hover:bg-green-50"
                  title="Visualizar"
                >
                  <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 rounded-md transition-colors hover:bg-blue-50"
                  title="Editar"
                >
                  <Edit className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 rounded-md transition-colors hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {statusDisplayMap[task.status]}
              </span>
              <span
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {priorityDisplayMap[task.priority]}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{task.assignedUsers?.[0]?.username || 'Não atribuído'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Título
              </th>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm hidden lg:table-cell" style={{ color: 'var(--text-primary)' }}>
                Descrição
              </th>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Status
              </th>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm hidden md:table-cell" style={{ color: 'var(--text-primary)' }}>
                Prioridade
              </th>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm hidden lg:table-cell" style={{ color: 'var(--text-primary)' }}>
                Prazo
              </th>
              <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-sm hidden xl:table-cell" style={{ color: 'var(--text-primary)' }}>
                Responsável
              </th>
              <th className="text-center p-2 sm:p-3 lg:p-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b hover:bg-opacity-50 transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'transparent'
                }}
              >
                <td className="p-2 sm:p-3 lg:p-4">
                  <div className="font-medium line-clamp-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                  </div>
                </td>
                <td className="p-2 sm:p-3 lg:p-4 hidden lg:table-cell">
                  <div className="line-clamp-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {task.description || '-'}
                  </div>
                </td>
                <td className="p-2 sm:p-3 lg:p-4">
                  <span
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: getStatusColor(task.status) + '20',
                      color: getStatusColor(task.status)
                    }}
                  >
                    {statusDisplayMap[task.status]}
                  </span>
                </td>
                <td className="p-2 sm:p-3 lg:p-4 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <AlertCircle
                      className="w-3 h-3"
                      style={{ color: getPriorityColor(task.priority) }}
                    />
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      {priorityDisplayMap[task.priority]}
                    </span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 lg:p-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 lg:p-4 hidden xl:table-cell">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {task.assignedUsers && task.assignedUsers.length > 0
                        ? task.assignedUsers[0].username
                        : '-'
                      }
                    </span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onView(task)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(task)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{ color: 'var(--status-review)' }}
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(task.id)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{ color: 'var(--status-urgent)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: 'var(--text-muted)' + '30' }}
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Nenhuma tarefa encontrada
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TableView;