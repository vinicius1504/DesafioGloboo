import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel } from 'amqplib';

export interface EmailMessage {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: Channel | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
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

      // Declare the email queue
      await this.channel.assertQueue('email_queue', {
        durable: true,
      });

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

  async publishEmailMessage(emailMessage: EmailMessage): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const message = Buffer.from(JSON.stringify(emailMessage));
      
      const sent = this.channel.sendToQueue('email_queue', message, {
        persistent: true,
      });

      if (sent) {
        this.logger.log(`Email message queued for ${emailMessage.to}`);
        return true;
      } else {
        this.logger.warn(`Failed to queue email message for ${emailMessage.to}`);
        return false;
      }
    } catch (error) {
      this.logger.error('Error publishing email message:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const emailMessage: EmailMessage = {
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        userName: userName || email,
        resetUrl,
        resetToken,
      },
    };

    return this.publishEmailMessage(emailMessage);
  }
}
