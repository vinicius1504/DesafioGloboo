import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommunicationService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
  ) {}

  async sendTaskCreated(taskData: any) {
    return this.notificationsClient.emit('task_created', taskData);
  }

  async sendTaskUpdated(taskData: any) {
    return this.notificationsClient.emit('task_updated', taskData);
  }

  async sendTaskDeleted(taskId: string) {
    return this.notificationsClient.emit('task_deleted', { taskId });
  }

  async sendCommentAdded(commentData: any) {
    return this.notificationsClient.emit('comment_added', commentData);
  }

  async validateUserToken(token: string) {
    return this.authClient.send('validate_token', { token }).toPromise();
  }

  async getUserById(userId: string) {
    return this.authClient.send('get_user', { userId }).toPromise();
  }
}