import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, OnModuleInit } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RabbitMQService, TaskEvent } from '../shared/services/rabbitmq.service';

interface WebSocketTaskEvent {
  eventType: 'task:created' | 'task:updated' | 'comment:new';
  taskId: string;
  data: any;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/tasks',
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TaskGateway.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    this.setupRabbitMQConsumer();
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // You can add authentication here if needed
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-task')
  handleJoinTask(@MessageBody() taskId: string, @ConnectedSocket() client: Socket) {
    client.join(`task-${taskId}`);
    this.logger.log(`Client ${client.id} joined task room: ${taskId}`);
    return { event: 'joined', taskId };
  }

  @SubscribeMessage('leave-task')
  handleLeaveTask(@MessageBody() taskId: string, @ConnectedSocket() client: Socket) {
    client.leave(`task-${taskId}`);
    this.logger.log(`Client ${client.id} left task room: ${taskId}`);
    return { event: 'left', taskId };
  }

  private setupRabbitMQConsumer() {
    // Consume task events from RabbitMQ
    this.rabbitMQService.consumeTaskEvents(async (event: TaskEvent) => {
      try {
        this.logger.log(`Received task event: ${event.eventType} for task ${event.taskId}`);

        // Map RabbitMQ event types to WebSocket event types
        const wsEventType = event.eventType.replace('.', ':') as WebSocketTaskEvent['eventType'];

        // Broadcast to all clients in the task room
        this.server.to(`task-${event.taskId}`).emit(wsEventType, {
          taskId: event.taskId,
          data: event.data,
          timestamp: event.timestamp,
        });

        // Also broadcast to a general tasks room for dashboard updates
        this.server.to('tasks').emit(wsEventType, {
          taskId: event.taskId,
          data: event.data,
          timestamp: event.timestamp,
        });

      } catch (error) {
        this.logger.error(`Error processing task event:`, error);
      }
    });
  }

  // Method to emit events programmatically (can be called from services)
  emitTaskEvent(event: WebSocketTaskEvent) {
    this.server.to(`task-${event.taskId}`).emit(event.eventType, {
      taskId: event.taskId,
      data: event.data,
      timestamp: event.timestamp,
    });

    this.server.to('tasks').emit(event.eventType, {
      taskId: event.taskId,
      data: event.data,
      timestamp: event.timestamp,
    });
  }
}