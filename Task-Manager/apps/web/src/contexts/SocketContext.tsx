import React, { createContext, useContext, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  onlineUsers: any[];
  searchUsers: (query: string) => Promise<any[]>;
  sendNotification: (userId: string, message: string, taskId?: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children
}) => {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};