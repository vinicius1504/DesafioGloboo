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
  onToggleNotifications
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <div className="w-full px-3 lg:px-4 xl:px-6 2xl:px-8 pt-3 lg:pt-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto rounded-lg lg:rounded-xl p-3 lg:p-6 shadow-lg"
        style={{ background: 'var(--gradient-bg)' }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-base lg:text-2xl font-bold text-white">Task Flow</h1>
            <p className="text-white/80 text-xs lg:text-sm hidden lg:block">Gerencie suas tarefas de forma eficiente e colaborativa</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4"
          >
            {/* Notification Bell */}
            <motion.button
              onClick={onToggleNotifications}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold text-xs"
                  style={{ fontSize: '9px', lineHeight: '1' }}
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
              className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/10 hover:bg-white/20"
            >
              {theme === 'light' ?
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> :
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              }
            </motion.button>

            {/* User Section */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center"
              >
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </motion.div>

              <motion.button
                onClick={() => logout()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/80 hover:text-white text-xs sm:text-sm px-1"
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