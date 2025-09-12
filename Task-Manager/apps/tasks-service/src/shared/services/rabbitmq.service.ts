import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

export interface TaskEvent {
  eventType: 'task.created' | 'task.updated' | 'comment.created';
  taskId: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const rabbitmqUrl = this.configService.get<string>('rabbitmq.url') || 'amqp://localhost:5672';

      this.connection = await connect(rabbitmqUrl);

      if (!this.connection) {
        throw new Error('Failed to establish RabbitMQ connection');
      }

      this.channel = await this.connection.createChannel();

      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Declare exchanges and queues
      await this.channel.assertExchange('task-events', 'topic', { durable: true });
      await this.channel.assertQueue('task-events-queue', { durable: true });
      await this.channel.bindQueue('task-events-queue', 'task-events', 'task.#');

      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  async publishTaskEvent(event: TaskEvent): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const message = Buffer.from(JSON.stringify(event));
      const routingKey = event.eventType;

      const sent = this.channel.publish('task-events', routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });

      if (sent) {
        this.logger.log(`Task event published: ${event.eventType} for task ${event.taskId}`);
      } else {
        this.logger.warn(`Failed to publish task event: ${event.eventType}`);
      }

      return sent;
    } catch (error) {
      this.logger.error('Error publishing task event:', error);
      return false;
    }
  }

  async consumeTaskEvents(callback: (event: TaskEvent) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.consume('task-events-queue', async (msg) => {
        if (msg) {
          try {
            const event: TaskEvent = JSON.parse(msg.content.toString());
            await callback(event);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing task event:', error);
            this.channel.nack(msg, false, false); // Don't requeue
          }
        }
      });

      this.logger.log('Started consuming task events');
    } catch (error) {
      this.logger.error('Error setting up task event consumer:', error);
      throw error;
    }
  }
}