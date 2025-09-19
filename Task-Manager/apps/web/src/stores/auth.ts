import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, ApiError } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  username: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
  debugAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)

          console.log('🔑 Login response:', response);
          console.log('💾 Token recebido:', response.access_token);

          const user = {
            id: response.user.id,
            name: response.user.username,
            email: response.user.email,
            username: response.user.username
          }

          // Salvar também diretamente no localStorage para garantir
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          set({
            user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false
          })

          console.log('✅ Token salvo no Zustand e localStorage');

          // Notificação de sucesso com detalhes
          toast.success(
            `Login realizado com sucesso!\nBem-vindo(a), ${user.name}!`,
            {
              duration: 4000,
              style: {
                background: '#10B981',
                color: '#ffffff',
                fontWeight: '500',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#10B981',
              },
            }
          )
        } catch (error) {
          set({ isLoading: false })

          if (error instanceof ApiError) {
            toast.error(`${error.message}`, {
              duration: 3000,
              style: {
                background: '#EF4444',
                color: '#ffffff',
                fontWeight: '500',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
              }
            })
          } else {
            toast.error('Erro de conexão. Verifique sua internet.', {
              duration: 3000
            })
          }
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(name, email, password)

          const user = {
            id: response.user.id,
            name: response.user.username,
            email: response.user.email,
            username: response.user.username
          }

          // Salvar também diretamente no localStorage para garantir
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          set({
            user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false
          })

          // Notificação de sucesso para registro
          toast.success(
            `Conta criada com sucesso!\nOlá, ${user.name}! Seja bem-vindo(a)!`,
            {
              duration: 4000,
              style: {
                background: '#8B5CF6',
                color: '#ffffff',
                fontWeight: '500',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#8B5CF6',
              },
            }
          )
        } catch (error) {
          set({ isLoading: false })

          if (error instanceof ApiError) {
            toast.error(`${error.message}`, {
              duration: 3000,
              style: {
                background: '#EF4444',
                color: '#ffffff',
                fontWeight: '500',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
              }
            })
          } else {
            toast.error('Erro de conexão. Tente novamente.', {
              duration: 3000
            })
          }
          throw error
        }
      },

      logout: () => {
        toast.success(' Logout realizado com sucesso!', {
          duration: 2000,
          style: {
            background: '#6B7280',
            color: '#ffffff',
            fontWeight: '500',
            padding: '12px 20px',
            borderRadius: '10px',
          }
        })

        // Limpar também do localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth-storage'); // Limpar cache do Zustand também

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      debugAuth: () => {
        const state = useAuthStore.getState();
        console.log('🐛 Debug Auth State:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          hasAccessToken: !!state.accessToken,
          accessTokenLength: state.accessToken?.length,
          accessTokenPreview: state.accessToken?.substring(0, 20) + '...'
        });
      }
    }),
    {
      name: 'auth-storage',
      // Remover partialize para salvar tudo
    }
  )
)