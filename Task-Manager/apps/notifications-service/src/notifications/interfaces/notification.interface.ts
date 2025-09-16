export interface NotificationInterface {
  id: number;
  message: string;
  userId?: string;
  taskId?: string;
  createdAt: Date;
}