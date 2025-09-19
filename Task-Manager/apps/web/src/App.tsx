import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuthStore } from '@/stores/auth'
import { ThemeProvider } from '@/theme'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <ThemeProvider>
      {isAuthenticated && user ? (
        <>
          <Dashboard />
          <Toaster
            position="top-right"
            containerStyle={{
              top: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: 'var(--priority-low)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--status-urgent)',
                  secondary: 'white',
                },
              },
            }}
          />
        </>
      ) : (
        <>
          <LoginPage />
          <Toaster
            position="top-right"
            containerStyle={{
              top: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </>
      )}
    </ThemeProvider>
  )
}

export default App
