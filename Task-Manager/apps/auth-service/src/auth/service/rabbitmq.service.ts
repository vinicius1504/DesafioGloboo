import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

export interface AuthEvent {
  eventType: 'user.registered' | 'user.logged_in' | 'user.password_changed';
  userId: string;
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

        // Declare exchanges and queues for auth events
        await this.channel.assertExchange('auth-events', 'topic', { durable: true });
        await this.channel.assertQueue('auth-events-queue', { durable: true });
        await this.channel.bindQueue('auth-events-queue', 'auth-events', 'user.#');

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

  async publishAuthEvent(event: AuthEvent): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const message = Buffer.from(JSON.stringify(event));
      const routingKey = event.eventType;

      const sent = this.channel.publish('auth-events', routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });

      if (sent) {
        this.logger.log(`Auth event published: ${event.eventType} for user ${event.userId}`);
      } else {
        this.logger.warn(`Failed to publish auth event: ${event.eventType}`);
      }

      return sent;
    } catch (error) {
      this.logger.error('Error publishing auth event:', error);
      return false;
    }
  }

  async consumeAuthEvents(callback: (event: AuthEvent) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.consume('auth-events-queue', async (msg) => {
        if (msg) {
          try {
            const event: AuthEvent = JSON.parse(msg.content.toString());
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