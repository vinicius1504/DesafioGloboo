import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { RabbitMQService, NotificationEvent } from '../../shared/rabbitmq.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    // Setup RabbitMQ consumers
    await this.setupRabbitMQConsumers();
  }

  // Lógica para consumir RabbitMQ e persistir notificações
  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }

  async findOne(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  private async setupRabbitMQConsumers(): Promise<void> {
    // Consume task events
    await this.rabbitMQService.consumeTaskEvents(async (event: NotificationEvent) => {
      await this.handleTaskEvent(event);
    });

    // Consume auth events
    await this.rabbitMQService.consumeAuthEvents(async (event: NotificationEvent) => {
      await this.handleAuthEvent(event);
    });
  }

  private async handleTaskEvent(event: NotificationEvent): Promise<void> {
    try {
      let message = '';
      let userId = '';

      switch (event.eventType) {
        case 'task.created':
          message = `New task created: ${event.data.task.title}`;
          userId = event.data.createdBy;
          break;
        case 'task.updated':
          message = `Task updated: ${event.data.task.title}`;
          userId = event.data.updatedBy;
          break;
        case 'task.deleted':
          message = `Task deleted`;
          userId = event.data.deletedBy;
          break;
      }

      if (message && userId) {
        await this.create({
          message,
          userId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error handling task event:', error);
    }
  }

  private async handleAuthEvent(event: NotificationEvent): Promise<void> {
    try {
      let message = '';
      let userId = '';

      switch (event.eventType) {
        case 'user.registered':
          message = `Welcome ${event.data.username}! Your account has been created successfully.`;
          userId = event.data.userId;
          break;
        case 'user.logged_in':
          message = `Welcome back ${event.data.username}!`;
          userId = event.data.userId;
          break;
      }

      if (message && userId) {
        await this.create({
          message,
          userId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error handling auth event:', error);
    }
  }
}