import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'task_assignment';
  timestamp: string;
  from?: string;
  taskId?: string;
  isRead: boolean;
}

export const useNotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 10 seconds if it's not a task assignment
    if (notification.type !== 'task_assignment') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
};