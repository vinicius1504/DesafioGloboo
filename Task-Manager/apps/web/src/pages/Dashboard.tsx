import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/auth';
import { Sun, Moon, Search, Plus, BarChart3 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { api } from '../lib/api';
import { useNotifications } from '../hooks/useNotifications';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'EM_PROGRESSO' | 'EM_REVISAO' | 'A_FAZER' | 'URGENTE';
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  dueDate: string;
  assignees: Array<{ id: string; name: string; avatar: string }>;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, debugAuth } = useAuthStore();
  const { showTaskCreated, showTaskUpdated, showTaskDeleted, showError, showConnectionError } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [priorityFilter, setPriorityFilter] = useState('Todas as Prioridades');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get<Task[]>('/api/tasks');
      setTasks(response);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      showConnectionError();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const response = await api.post<Task>('/api/tasks', taskData);
      setTasks(prev => [...prev, response]);
      showTaskCreated(taskData.title || 'Nova tarefa');
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      showError('Erro ao criar tarefa');
    }
  };

  const handleEditTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;

    try {
      const response = await api.put<Task>(`/api/tasks/${editingTask.id}`, taskData);
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id ? response : task
      ));
      showTaskUpdated(editingTask.title);
      setEditingTask(null);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      showError('Erro ao editar tarefa');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      showTaskDeleted(taskToDelete?.title || 'Tarefa');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      showError('Erro ao excluir tarefa');
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos os Status' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'Todas as Prioridades' || task.priority === priorityFilter;

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
                onClick={logout}
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
                <option value="EM_PROGRESSO">Em Progresso</option>
                <option value="EM_REVISAO">Em Revisão</option>
                <option value="A_FAZER">A Fazer</option>
                <option value="URGENTE">Urgente</option>
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
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
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
                {tasks.filter(t => t.status === 'EM_PROGRESSO').length}
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pendentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-todo)' }}>
                {tasks.filter(t => t.status === 'A_FAZER').length}
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Urgentes</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--status-urgent)' }}>
                {tasks.filter(t => t.status === 'URGENTE').length}
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
    </div>
  );
};

export default Dashboard;