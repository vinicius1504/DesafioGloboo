import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers';
import { useAuthStore } from '@/stores/auth';

interface HeaderProps {
  unreadCount: number;
  showNotifications: boolean;
  onToggleNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({
  unreadCount,
  showNotifications,
  onToggleNotifications
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, debugAuth } = useAuthStore();

  return (
    <div className="w-full px-6 pt-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto rounded-xl p-6 shadow-lg"
        style={{ background: 'var(--gradient-bg)' }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold text-white">Task Manager Pro</h1>
            <p className="text-white/80 text-sm">Gerencie suas tarefas de forma eficiente e colaborativa</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            {/* Notification Bell */}
            <motion.button
              onClick={onToggleNotifications}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ fontSize: '10px' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              {theme === 'light' ?
                <Moon className="w-5 h-5 text-white" /> :
                <Sun className="w-5 h-5 text-white" />
              }
            </motion.button>

            {/* User Section */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={debugAuth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs"
              >
                Debug
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
              >
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </motion.div>

              <motion.button
                onClick={() => logout()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/80 hover:text-white text-sm"
              >
                Sair
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.header>
    </div>
  );
};

export default Header;