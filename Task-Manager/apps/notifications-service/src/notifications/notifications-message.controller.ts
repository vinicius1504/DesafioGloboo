import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationsService } from './services/notifications.service';

@Controller()
export class NotificationsMessageController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('send_notification')
  async sendNotification(data: any) {
    try {
      await this.notificationsService.create(data);
      return { success: true };
    } catch (error) {
      return { error: 'Failed to send notification' };
    }
  }

  @MessagePattern('user_registered')
  async handleUserRegistered(data: any) {
    // Handle user registered event
    console.log('User registered event received:', data);
    const notification = {
      userId: data.userId,
      title: 'Welcome!',
      message: `Welcome to Task Manager, ${data.username}!`,
      type: 'WELCOME',
    };
    await this.notificationsService.create(notification);
    return { success: true };
  }

  @MessagePattern('user_login')
  async handleUserLogin(data: any) {
    // Handle user login event
    console.log('User login event received:', data);
    return { success: true };
  }

  @MessagePattern('task_created')
  async handleTaskCreated(data: any) {
    // Handle task created event
    console.log('Task created event received:', data);
    return { success: true };
  }

  @MessagePattern('comment_added')
  async handleCommentAdded(data: any) {
    // Handle comment added event
    console.log('Comment added event received:', data);
    return { success: true };
  }
}