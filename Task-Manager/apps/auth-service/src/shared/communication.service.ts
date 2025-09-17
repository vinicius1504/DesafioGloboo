import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommunicationService {
  constructor(
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
  ) {}

  async sendTaskCreated(taskData: any) {
    return this.tasksClient.emit('task_created', taskData);
  }

  async sendTaskUpdated(taskData: any) {
    return this.tasksClient.emit('task_updated', taskData);
  }

  async sendTaskDeleted(taskId: string) {
    return this.tasksClient.emit('task_deleted', { taskId });
  }

  async sendNotification(notificationData: any) {
    return this.notificationsClient.emit('send_notification', notificationData);
  }

  async sendUserRegistered(userData: any) {
    return this.notificationsClient.emit('user_registered', userData);
  }

  async sendUserLogin(userData: any) {
    return this.notificationsClient.emit('user_login', userData);
  }
}