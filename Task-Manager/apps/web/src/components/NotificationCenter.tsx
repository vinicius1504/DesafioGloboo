import React from 'react';
import { X, Bell, User, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'task_assignment';
  timestamp: string;
  from?: string;
  taskId?: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onClearAll,
  isVisible = true,
  onToggleVisibility
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'task_assignment':
        return <User className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString();
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-sm">
      {/* Header */}
      <div
        className="rounded-t-lg px-4 py-3 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notificações
          </span>
          {unreadCount > 0 && (
            <span
              className="px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs px-2 py-1 rounded hover:bg-opacity-80 transition-colors"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              Limpar todas
            </button>
          )}
          <button
            onClick={onToggleVisibility}
            className="p-1 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div
        className="max-h-96 overflow-y-auto rounded-b-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {notifications.slice(0, 5).map((notification) => (
          <div
            key={notification.id}
            className={`group px-4 py-3 border-b transition-colors cursor-pointer hover:bg-opacity-50 ${
              !notification.isRead ? 'border-l-4' : ''
            }`}
            style={{
              borderColor: 'var(--border-color)',
              borderLeftColor: !notification.isRead ? 'var(--brand-primary)' : 'transparent',
              backgroundColor: !notification.isRead ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => onMarkAsRead(notification.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = !notification.isRead ? 'var(--bg-secondary)' : 'transparent';
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {notification.message}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {notification.from && `De: ${notification.from} • `}
                    {formatTime(notification.timestamp)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length > 5 && (
          <div
            className="px-4 py-2 text-center text-xs"
            style={{
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            E mais {notifications.length - 5} notificações...
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;