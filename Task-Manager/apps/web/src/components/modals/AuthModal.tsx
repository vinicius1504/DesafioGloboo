import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [registerError, setRegisterError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { login, register, isLoading } = useAuthStore()

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginData.email, loginData.password)
      setIsRedirecting(true)

      // Wait 5 seconds to show the success notification
      setTimeout(() => {
        onClose()
        navigate({ to: '/dashboard' })
        resetForms()
        setIsRedirecting(false)
      }, 5000) // 5 seconds delay

    } catch (error) {
      // Error handling is done in the store
      setIsRedirecting(false)
    }
  }

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem')
      return
    }

    if (registerData.password.length < 6) {
      setRegisterError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      await register(registerData.name, registerData.email, registerData.password)
      setIsRedirecting(true)

      // Wait 5 seconds to show the success notification
      setTimeout(() => {
        onClose()
        navigate({ to: '/dashboard' })
        resetForms()
        setIsRedirecting(false)
      }, 5000) // 5 seconds delay

    } catch (error) {
      // Error handling is done in the store
      setIsRedirecting(false)
    }
  }

  const switchToRegister = () => {
    setActiveTab('register')
    setRegisterError('')
  }

  const switchToLogin = () => {
    setActiveTab('login')
    setRegisterError('')
  }

  const resetForms = () => {
    setLoginData({ email: '', password: '' })
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setRegisterError('')
    setIsRedirecting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm lg:max-w-md rounded-xl lg:rounded-2xl p-4 lg:p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mx-4 lg:mx-0"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            TaskFlow
          </h2>
          <p className="text-white/70 text-xs sm:text-sm">
            Organize sua vida de forma simples
          </p>
        </div>

        {/* Tab Selector */}
        {!isRedirecting && (
        <div className="flex mb-4 sm:mb-6 bg-white/10 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={switchToLogin}
          >
            Entrar
          </button>
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={switchToRegister}
          >
            Criar conta
          </button>
        </div>
        )}

        {/* Success Screen */}
        {isRedirecting && (
          <div className="text-center py-6 sm:py-8">
            <div className="mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {activeTab === 'login' ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!'}
              </h3>
              <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
                Você será redirecionado em instantes...
              </p>
              <div className="flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && !isRedirecting && (
          <form onSubmit={onLoginSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Email ou Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="seu@email.com ou username"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-white/60 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg transition-colors font-medium bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && !isRedirecting && (
          <form onSubmit={onRegisterSubmit} className="space-y-4">
            {registerError && (
              <div className="p-3 rounded-lg border border-red-300/50 bg-red-500/10 text-red-200 text-sm">
                {registerError}
              </div>
            )}

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Seu username"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={registerData.name}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={registerData.password}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-white/60 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-white/90">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm sm:text-base"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-white/60 hover:text-white/80"
                >
                  {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-lg transition-colors font-medium bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Criando conta...</span>
                </div>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}