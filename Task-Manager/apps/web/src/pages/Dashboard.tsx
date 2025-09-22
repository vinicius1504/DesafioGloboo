import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/providers';
import { useAuthStore } from '@/stores/auth';
import { Sun, Moon, Search, Plus, BarChart3, Bell, Grid3X3, Kanban, Table } from 'lucide-react';
import { TaskCard, TaskModal, TaskViewModal, NotificationCenter } from '@/components';
import KanbanView from '@/components/views/KanbanView';
import TableView from '@/components/views/TableView';
import Header from '@/components/layout/Header';
import { SocketProvider } from '@/providers';
import { api } from '@/lib/api';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import type { Task } from '@/types';


const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  useTheme();
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
  const [viewMode, setViewMode] = useState<'cards' | 'kanban' | 'table'>('cards');

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

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    try {
      // Preparar dados para o backend
      const backendData = {
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        status: newStatus,
        priority: taskToUpdate.priority,
        dueDate: taskToUpdate.dueDate
      };

      // Adicionar assignedUserIds se existirem
      if (taskToUpdate.assignedUsers && taskToUpdate.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskToUpdate.assignedUsers.map(user => user.id);
      }

      const response = await api.put<Task>(`/api/tasks/${taskId}`, backendData);

      // Atualizar a lista de tarefas
      setTasks(prev => prev.map(task =>
        task.id === taskId ? response : task
      ));

      // Mapear status para display
      const statusDisplayMap = {
        'TODO': 'A Fazer',
        'IN_PROGRESS': 'Em Progresso',
        'REVIEW': 'Em Revisão',
        'DONE': 'Concluído'
      };

      // Adicionar notificação de sucesso
      addNotification({
        message: `Tarefa "${taskToUpdate.title}" movida para "${statusDisplayMap[newStatus]}"!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);

      // Adicionar notificação de erro
      addNotification({
        message: 'Erro ao mover tarefa. Tente novamente.',
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Header
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-6 mb-8 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
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

              {/* View Mode Selector */}
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => setViewMode('cards')}
                  className="px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === 'cards' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: viewMode === 'cards' ? 'white' : 'var(--text-primary)'
                  }}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className="px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === 'kanban' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: viewMode === 'kanban' ? 'white' : 'var(--text-primary)'
                  }}
                >
                  <Kanban className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className="px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === 'table' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: viewMode === 'table' ? 'white' : 'var(--text-primary)'
                  }}
                >
                  <Table className="w-4 h-4" />
                  Tabela
                </button>
              </div>

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
          <motion.button
            onClick={openCreateModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </motion.button>
        </motion.div>

        {/* Dashboard Stats (when enabled) */}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Total</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{tasks.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Em Progresso</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-progress)' }}>
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pendentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-todo)' }}>
                {tasks.filter(t => t.status === 'TODO').length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Urgentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-urgent)' }}>
                {tasks.filter(t => t.status === 'DONE').length}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Tasks Display */}
        {filteredTasks.length > 0 ? (
          <>
            {viewMode === 'cards' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={() => openViewModal(task)}
                    onEdit={() => openEditModal(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === 'kanban' && (
              <KanbanView
                tasks={filteredTasks}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {viewMode === 'table' && (
              <TableView
                tasks={filteredTasks}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Search className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Nenhuma tarefa encontrada
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {tasks.length === 0 ? 'Crie sua primeira tarefa!' : 'Tente ajustar os filtros ou termos de busca.'}
            </p>
          </motion.div>
        )}
      </motion.div>

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
    </motion.div>
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