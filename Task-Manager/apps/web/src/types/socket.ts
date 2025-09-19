import { Socket } from 'socket.io-client';

export interface OnlineUser {
  id: string;
  username: string;
  email: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  searchUsers: (query: string) => Promise<OnlineUser[]>;
  sendNotification: (userId: string, message: string, taskId?: string) => void;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  searchUsers: (query: string) => Promise<OnlineUser[]>;
  sendNotification: (userId: string, message: string, taskId?: string) => void;
}