import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/Login'
import { useAuthStore } from './stores/auth'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Bem-vindo, {user.name}!
          </h1>
          <p className="text-gray-600 mb-6">
            Você está logado como {user.email}
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <>
      <LoginPage />
      <Toaster position="top-right" />
    </>
  )
}

export default App
