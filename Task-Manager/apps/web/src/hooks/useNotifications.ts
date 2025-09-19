import toast from 'react-hot-toast';

interface NotificationOptions {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export const useNotifications = () => {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--priority-low)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-lg)',
      },
      iconTheme: {
        primary: 'var(--priority-low)',
        secondary: 'white',
      },
    });
  };

  const showError = (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      style: {
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--status-urgent)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-lg)',
      },
      iconTheme: {
        primary: 'var(--status-urgent)',
        secondary: 'white',
      },
    });
  };

  const showWarning = (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--status-review)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-lg)',
      },
    });
  };

  const showInfo = (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
      style: {
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--status-progress)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-lg)',
      },
    });
  };

  const showTaskCreated = (taskTitle: string) => {
    showSuccess(`Tarefa "${taskTitle}" criada com sucesso!`);
  };

  const showTaskUpdated = (taskTitle: string) => {
    showSuccess(`Tarefa "${taskTitle}" atualizada com sucesso!`);
  };

  const showTaskDeleted = (taskTitle: string) => {
    showInfo(`Tarefa "${taskTitle}" foi excluída`);
  };

  const showTaskStatusChanged = (taskTitle: string, newStatus: string) => {
    const statusLabels = {
      'TODO': 'A Fazer',
      'IN_PROGRESS': 'Em Progresso',
      'REVIEW': 'Em Revisão',
      'DONE': 'Concluído'
    };

    const label = statusLabels[newStatus as keyof typeof statusLabels] || newStatus;
    showInfo(`Status da tarefa "${taskTitle}" alterado para: ${label}`);
  };

  const showTaskAssigned = (taskTitle: string, assigneeName: string) => {
    showInfo(`${assigneeName} foi atribuído à tarefa "${taskTitle}"`);
  };

  const showConnectionError = () => {
    showError('Erro de conexão. Verifique sua internet e tente novamente.');
  };

  const showValidationError = (field: string) => {
    showWarning(`Campo "${field}" é obrigatório`);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTaskCreated,
    showTaskUpdated,
    showTaskDeleted,
    showTaskStatusChanged,
    showTaskAssigned,
    showConnectionError,
    showValidationError,
  };
};