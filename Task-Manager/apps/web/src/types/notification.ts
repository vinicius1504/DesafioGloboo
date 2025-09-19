export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'task_assignment';
  timestamp: string;
  from?: string;
  taskId?: string;
  isRead: boolean;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}