import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Task } from '@/types'

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null

  // Actions
  fetchTasks: () => Promise<void>
  createTask: (taskData: Partial<Task>) => Promise<Task>
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<Task>
  clearTasks: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ loading: true, error: null })

      const response = await api.get<{data: Task[], total: number, page: number, size: number, totalPages: number}>('/api/tasks')

      const tasksArray = response.data || []

      set({ tasks: tasksArray, loading: false })
    } catch (error) {

      let errorMessage = 'Erro de conexão ao carregar tarefas. Verifique sua internet.'
      if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.'
      }

      set({
        loading: false,
        error: errorMessage,
        tasks: []
      })
      throw error
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    try {
      set({ loading: true, error: null })

      const backendData: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      }

      if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskData.assignedUsers.map(user => user.id)
      }


      const response = await api.post<Task>('/api/tasks', backendData)

      set(state => ({
        tasks: [...state.tasks, response],
        loading: false
      }))

      return response
    } catch (error) {
      set({ loading: false, error: 'Erro ao criar tarefa. Tente novamente.' })
      throw error
    }
  },

  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    try {
      set({ loading: true, error: null })

      const backendData: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      }

      if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskData.assignedUsers.map(user => user.id)
      }


      const response = await api.put<Task>(`/api/tasks/${taskId}`, backendData)

      set(state => ({
        tasks: state.tasks.map(task => task.id === taskId ? response : task),
        loading: false
      }))

      return response
    } catch (error) {
      set({ loading: false, error: 'Erro ao editar tarefa. Tente novamente.' })
      throw error
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      set({ loading: true, error: null })

      await api.delete(`/api/tasks/${taskId}`)

      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        loading: false
      }))
    } catch (error) {
      set({ loading: false, error: 'Erro ao excluir tarefa. Tente novamente.' })
      throw error
    }
  },

  updateTaskStatus: async (taskId: string, newStatus: string) => {
    try {
      const state = get()
      const taskToUpdate = state.tasks.find(task => task.id === taskId)
      if (!taskToUpdate) {
        throw new Error('Tarefa não encontrada')
      }

      // Atualizar otimisticamente primeiro
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus as Task['status'] }
            : task
        ),
        error: null
      }))


      const backendData: any = {
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        status: newStatus,
        priority: taskToUpdate.priority,
        dueDate: taskToUpdate.dueDate
      }

      if (taskToUpdate.assignedUsers && taskToUpdate.assignedUsers.length > 0) {
        backendData.assignedUserIds = taskToUpdate.assignedUsers.map(user => user.id)
      }

      // Fazer chamada da API em background sem loading
      try {
        const response = await api.put<Task>(`/api/tasks/${taskId}`, backendData)

        // Atualizar com dados reais da API
        set(state => ({
          tasks: state.tasks.map(task => task.id === taskId ? response : task)
        }))

        return response
      } catch (apiError) {

        // Reverter mudança otimista em caso de erro
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, status: taskToUpdate.status }
              : task
          ),
          error: 'Erro ao mover tarefa. Tente novamente.'
        }))

        throw apiError
      }
    } catch (error) {
      set({ error: 'Erro ao mover tarefa. Tente novamente.' })
      throw error
    }
  },

  clearTasks: () => {
    set({ tasks: [], loading: false, error: null })
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },

  setError: (error: string | null) => {
    set({ error })
  }
}))