import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Search, Users, Wifi, WifiOff } from 'lucide-react';
import { useSocketContext } from '../../providers/SocketContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  assignedUsers?: Array<{ id: string; username: string; email: string; isActive: boolean; createdAt: string; updatedAt: string }>;
  createdAt: string;
  updatedAt: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as Task['status'],
    priority: 'MEDIUM' as Task['priority'],
    dueDate: '',
    assignedUsers: [] as Array<{ id: string; username: string; email: string; isActive: boolean; createdAt: string; updatedAt: string }>
  });

  const [newAssignee, setNewAssignee] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; email: string; status: 'online' | 'offline' }>>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const { searchUsers, onlineUsers, sendNotification, isConnected } = useSocketContext();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.split('T')[0], // Format for input[type="date"]
        assignedUsers: task.assignedUsers || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assignedUsers: []
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
    };
    console.log('🔍 TaskModal form data being submitted:', submitData);
    onSubmit(submitData);
  };

  // Busca de usuários em tempo real
  const handleSearchChange = async (value: string) => {
    setNewAssignee(value);
    if (value.trim().length >= 2) {
      setShowSearchDropdown(true);
      const results = await searchUsers(value);
      setSearchResults(results);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }
  };

  const addAssigneeFromSearch = (user: { id: string; username: string; email: string; status: 'online' | 'offline' }) => {
    // Verificar se já não está atribuído
    if (formData.assignedUsers.some(assigned => assigned.id === user.id)) {
      return;
    }

    const assignee = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      assignedUsers: [...prev.assignedUsers, assignee]
    }));

    // Enviar notificação
    sendNotification(user.id, `Você foi atribuído à tarefa: ${formData.title || 'Nova tarefa'}`);

    setNewAssignee('');
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const addAssignee = () => {
    if (newAssignee.trim()) {
      const assignee = {
        id: Math.random().toString(36).substr(2, 9),
        username: newAssignee.trim(),
        email: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        assignedUsers: [...prev.assignedUsers, assignee]
      }));
      setNewAssignee('');
    }
  };

  const removeAssignee = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter(a => a.id !== id)
    }));
  };

  const generateAvatar = (name: string) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus-ring"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              placeholder="Digite o título da tarefa"
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="Descreva os detalhes da tarefa"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  }}
              >
                <option value="TODO">A Fazer</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="REVIEW">Em Revisão</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  }}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Prazo
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  }}
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Colaboradores
            </label>

            {/* Add Assignee */}
            <div className="relative mb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar colaborador..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      }}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssignee())}
                  />
                  {/* Connection Status */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isConnected ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addAssignee}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => addAssigneeFromSearch(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
                      style={{
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* User Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: generateAvatar(user.username) }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {user.email}
                        </div>
                      </div>

                      {/* Online Status */}
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            user.status === 'online' ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {user.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Show online users count */}
              {isConnected && onlineUsers.length > 0 && (
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Users className="w-3 h-3 inline mr-1" />
                  {onlineUsers.length} usuário{onlineUsers.length !== 1 ? 's' : ''} online
                </div>
              )}
            </div>

            {/* Assignees List */}
            <div className="flex flex-wrap gap-2">
              {formData.assignedUsers.map((assignee) => (
                <div
                  key={assignee.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: generateAvatar(assignee.username) }}
                  >
                    {assignee.username.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {assignee.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAssignee(assignee.id)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white'
              }}
            >
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;