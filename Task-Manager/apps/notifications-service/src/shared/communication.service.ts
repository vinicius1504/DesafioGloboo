import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommunicationService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
  ) {}

  async getUserById(userId: string) {
    return this.authClient.send('get_user', { userId }).toPromise();
  }

  async getTaskById(taskId: string) {
    return this.tasksClient.send('get_task', { taskId }).toPromise();
  }

  async sendNotificationToUser(userId: string, notificationData: any) {
    return this.authClient.emit('notification_sent', { userId, ...notificationData });
  }
}