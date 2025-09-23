import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import type { OnlineUser, UseSocketReturn } from '@/types';

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) return;

    // Conectar ao socket (notifications service)
    const newSocket = io('http://localhost:3004', {
      auth: {
        token: accessToken,
        userId: user.id,
        username: user.username,
        email: user.email
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Escutar lista de usuários online
    newSocket.on('users:online', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Escutar notificações (removido para evitar duplicação)
    newSocket.on('notification:received', (notification: any) => {
      // Notificações serão tratadas apenas através do notification center
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, accessToken]);

  const searchUsers = async (query: string): Promise<OnlineUser[]> => {
    if (!socket || !query.trim()) return [];

    return new Promise((resolve) => {
      socket.emit('users:search', query, (users: OnlineUser[]) => {
        resolve(users);
      });
    });
  };

  const sendNotification = (userId: string, message: string, taskId?: string) => {
    if (!socket) return;

    socket.emit('notification:send', {
      targetUserId: userId,
      message,
      taskId,
      type: 'task_assignment'
    });
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    searchUsers,
    sendNotification
  };
};