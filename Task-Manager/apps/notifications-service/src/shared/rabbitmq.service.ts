import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

export interface NotificationEvent {
  eventType: 'task.created' | 'task.updated' | 'task.deleted' | 'user.registered' | 'user.logged_in';
  data: any;
  timestamp: Date;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
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
    const maxRetries = 10;
    const retryDelay = 5000; // 5 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';

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
        await this.channel.assertQueue('notifications-task-queue', { durable: true });
        await this.channel.bindQueue('notifications-task-queue', 'task-events', 'task.#');

        await this.channel.assertExchange('auth-events', 'topic', { durable: true });
        await this.channel.assertQueue('notifications-auth-queue', { durable: true });
        await this.channel.bindQueue('notifications-auth-queue', 'auth-events', 'user.#');

        this.logger.log('Successfully connected to RabbitMQ');
        return;
      } catch (error) {
        this.logger.warn(`Failed to connect to RabbitMQ (attempt ${attempt}/${maxRetries}):`, error.message);

        if (attempt === maxRetries) {
          this.logger.error('Max retries reached. Could not connect to RabbitMQ.');
          throw error;
        }

        this.logger.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
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

  async consumeTaskEvents(callback: (event: NotificationEvent) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.consume('notifications-task-queue', async (msg) => {
        if (msg) {
          try {
            const event: NotificationEvent = JSON.parse(msg.content.toString());
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

  async consumeAuthEvents(callback: (event: NotificationEvent) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.consume('notifications-auth-queue', async (msg) => {
        if (msg) {
          try {
            const event: NotificationEvent = JSON.parse(msg.content.toString());
            await callback(event);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing auth event:', error);
            this.channel.nack(msg, false, false); // Don't requeue
          }
        }
      });

      this.logger.log('Started consuming auth events');
    } catch (error) {
      this.logger.error('Error setting up auth event consumer:', error);
      throw error;
    }
  }
}