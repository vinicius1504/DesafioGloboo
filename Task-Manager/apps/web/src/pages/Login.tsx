import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { AuthModal } from '@/components/modals'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true)

  const openAuthModal = () => {
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />

      {/* Floating shapes animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full"
          animate={{
            y: [-10, -30, -15, -10],
            x: [0, 15, -10, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/10 rounded-full"
          animate={{
            y: [0, -20, -35, 0],
            x: [0, -25, 15, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-white/10 rounded-full"
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full"
          animate={{
            y: [0, 20, 35, 15, 0],
            x: [0, -15, 25, -10, 0],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-white/15 rounded-full"
          animate={{
            y: [-5, -25, -10, -5],
            x: [0, 10, -15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 w-28 h-28 bg-white/8 rounded-full"
          animate={{
            y: [0, -15, -25, -10, 0],
            x: [0, 20, -10, 15, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      {!isAuthModalOpen && (
        <div className="relative z-10 text-center text-white flex flex-col items-center justify-center min-h-screen">
          <div className="mx-auto mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">TaskFlow</h1>
          <p className="text-xl mb-8 text-white/90">Organize sua vida de forma simples</p>
          <Button
            onClick={openAuthModal}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-8 py-3 text-lg"
          >
            Fazer Login
          </Button>
        </div>
      )}
    </div>
  )
}