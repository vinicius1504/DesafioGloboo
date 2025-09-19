import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface OnlineUser {
  id: string;
  username: string;
  email: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface NotificationData {
  targetUserId: string;
  message: string;
  taskId?: string;
  type: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, { socket: Socket; user: OnlineUser }>();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const userId = client.handshake.auth?.userId;
      const username = client.handshake.auth?.username;

      if (!userId || !username) {
        this.logger.warn(`Client ${client.id} disconnected - missing auth data`);
        client.disconnect();
        return;
      }

      // Store connected user
      const user: OnlineUser = {
        id: userId,
        username: username,
        email: client.handshake.auth?.email || '',
        status: 'online'
      };

      this.connectedUsers.set(userId, { socket: client, user });
      client.join(`user-${userId}`);

      this.logger.log(`User ${username} (${userId}) connected`);

      // Broadcast updated online users list
      this.broadcastOnlineUsers();

    } catch (error) {
      this.logger.error('Error handling connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Find and remove user from connected users
    const userEntry = Array.from(this.connectedUsers.entries())
      .find(([_, data]) => data.socket.id === client.id);

    if (userEntry) {
      const [userId, { user }] = userEntry;
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${user.username} (${userId}) disconnected`);

      // Broadcast updated online users list
      this.broadcastOnlineUsers();
    }
  }

  @SubscribeMessage('users:search')
  async handleUserSearch(
    @MessageBody() query: string,
    @ConnectedSocket() client: Socket
  ) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.toLowerCase();
      const results: OnlineUser[] = [];

      // Search through connected users
      for (const [userId, { user }] of this.connectedUsers) {
        if (
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        ) {
          results.push(user);
        }
      }

      // Limit results and sort by online status first, then alphabetically
      const sortedResults = results
        .sort((a, b) => {
          if (a.status === 'online' && b.status === 'offline') return -1;
          if (a.status === 'offline' && b.status === 'online') return 1;
          return a.username.localeCompare(b.username);
        })
        .slice(0, 10);

      return sortedResults;
    } catch (error) {
      this.logger.error('Error searching users:', error);
      return [];
    }
  }

  @SubscribeMessage('notification:send')
  async handleSendNotification(
    @MessageBody() data: NotificationData,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { targetUserId, message, taskId, type } = data;

      // Send notification to target user
      this.server.to(`user-${targetUserId}`).emit('notification:received', {
        message,
        taskId,
        type,
        timestamp: new Date().toISOString(),
        from: client.handshake.auth?.username || 'Sistema'
      });

      this.logger.log(`Notification sent to user ${targetUserId}: ${message}`);

    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }

  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.connectedUsers.values()).map(({ user }) => user);
    this.server.emit('users:online', onlineUsers);
  }

  // Método para emitir eventos WebSocket (mantido para compatibilidade)
  emitNotification(event: string, data: any) {
    this.server.emit(event, data);
  }
}