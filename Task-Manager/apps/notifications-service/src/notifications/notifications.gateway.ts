import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Método para emitir eventos WebSocket
  emitNotification(event: string, data: any) {
    this.server.emit(event, data);
  }
}