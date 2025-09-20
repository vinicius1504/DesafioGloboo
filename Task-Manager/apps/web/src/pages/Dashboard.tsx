import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/providers';
import { useAuthStore } from '@/stores/auth';
import { Sun, Moon, Search, Plus, BarChart3, Bell } from 'lucide-react';
import { TaskCard, TaskModal, TaskViewModal, NotificationCenter } from '@/components';
import { SocketProvider } from '@/providers';
import { api } from '@/lib/api';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import type { Task } from '@/types';


const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, debugAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, user, navigate]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [priorityFilter, setPriorityFilter] = useState('Todas as Prioridades');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  // Notification Center
  const {
    notifications,
    addNotification,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    unreadCount
  } = useNotificationCenter();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    }
  }, [isAuthenticated, user]);

  const fetchTasks = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Usuário não autenticado, não buscando tarefas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Iniciando fetchTasks...');
      const response = await api.get<{data: Task[], total: number, page: number, size: number, totalPages: number}>('/api/tasks');
      console.log('📋 Resposta completa do backend:', response);

      // Extrair o array de tarefas do objeto de paginação
      const tasksArray = response.data || [];
      console.log('📊 Tarefas extraídas:', tasksArray);
      console.log('📊 Quantidade de tarefas:', tasksArray.length);

      setTasks(tasksArray);
    } catch (error) {
      console.error('❌ Erro ao buscar tarefas:', error);

      // Verificar se é erro de autenticação
      if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 401) {
        addNotification({
          message: 'Sessão expirada. Faça login novamente.',
          type: 'error'
        });
        logout(false); // Logout sem toast para evitar conflito
        navigate({ to: '/login' });
      } else {
        addNotification({
          message: 'Erro de conexão ao carregar tarefas. Verifique sua internet.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      // Clean data and convert frontend format to backend format
      const backendData: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      };

      // Only add assignedUserIds if we have assigned users
      if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskData.assignedUsers.map(user => user.id);
      }

      console.log('🚀 Sending clean backend data:', backendData);

      const response = await api.post<Task>('/api/tasks', backendData);
      setTasks(prev => [...prev, response]);

      // Adicionar notificação ao centro de notificações
      addNotification({
        message: `Tarefa "${taskData.title || 'Nova tarefa'}" foi criada com sucesso!`,
        type: 'success'
      });

      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);

      // Adicionar notificação de erro ao centro de notificações
      addNotification({
        message: 'Erro ao criar tarefa. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleEditTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;

    try {
      // Clean data and convert frontend format to backend format
      const backendData: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      };

      // Only add assignedUserIds if we have assigned users
      if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskData.assignedUsers.map(user => user.id);
      }

      console.log('✏️ Sending clean edit data:', backendData);

      const response = await api.put<Task>(`/api/tasks/${editingTask.id}`, backendData);
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id ? response : task
      ));

      // Adicionar notificação ao centro de notificações
      addNotification({
        message: `Tarefa "${editingTask.title}" foi atualizada com sucesso!`,
        type: 'success'
      });

      setEditingTask(null);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);

      // Adicionar notificação de erro ao centro de notificações
      addNotification({
        message: 'Erro ao editar tarefa. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);

    // Confirmação antes de excluir
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) {
      return; // Usuário cancelou
    }

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));

      // Adicionar notificação ao centro de notificações
      addNotification({
        message: `Tarefa "${taskToDelete?.title || 'Tarefa'}" foi excluída com sucesso!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);

      // Adicionar notificação de erro ao centro de notificações
      addNotification({
        message: 'Erro ao excluir tarefa. Tente novamente.',
        type: 'error'
      });
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openViewModal = (task: Task) => {
    setViewingTask(task);
    setIsTaskViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewingTask(null);
    setIsTaskViewModalOpen(false);
  };

  // Status and priority mappings for display
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos os Status' || statusDisplayMap[task.status] === statusFilter;
    const matchesPriority = priorityFilter === 'Todas as Prioridades' || priorityDisplayMap[task.priority] === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos os Status');
    setPriorityFilter('Todas as Prioridades');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="w-full px-6 py-4 shadow-sm" style={{ background: 'var(--gradient-bg)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Task Manager Pro</h1>
            <p className="text-white/80 text-sm">Gerencie suas tarefas de forma eficiente e colaborativa</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ fontSize: '10px' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={debugAuth}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
              >
                Debug
              </button>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="rounded-2xl p-6 mb-8 shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option>Todos os Status</option>
                <option value="A Fazer">A Fazer</option>
                <option value="Em Progresso">Em Progresso</option>
                <option value="Em Revisão">Em Revisão</option>
                <option value="Concluído">Concluído</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option>Todas as Prioridades</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>

              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: showDashboard ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: showDashboard ? 'white' : 'var(--text-primary)'
                }}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* New Task Button */}
          <button
            onClick={openCreateModal}
            className="w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>

        {/* Dashboard Stats (when enabled) */}
        {showDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Total</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{tasks.length}</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Em Progresso</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-progress)' }}>
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pendentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-todo)' }}>
                {tasks.filter(t => t.status === 'TODO').length}
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Urgentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-urgent)' }}>
                {tasks.filter(t => t.status === 'DONE').length}
              </p>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={() => openViewModal(task)}
                onEdit={() => openEditModal(task)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Search className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Nenhuma tarefa encontrada
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {tasks.length === 0 ? 'Crie sua primeira tarefa!' : 'Tente ajustar os filtros ou termos de busca.'}
            </p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          task={editingTask}
        />
      )}

      {/* Task View Modal */}
      {isTaskViewModalOpen && (
        <TaskViewModal
          isOpen={isTaskViewModalOpen}
          onClose={closeViewModal}
          task={viewingTask}
        />
      )}

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDismiss={dismissNotification}
          onClearAll={clearAllNotifications}
          isVisible={showNotifications}
          onToggleVisibility={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <SocketProvider>
      <DashboardContent />
    </SocketProvider>
  );
};

export default Dashboard;