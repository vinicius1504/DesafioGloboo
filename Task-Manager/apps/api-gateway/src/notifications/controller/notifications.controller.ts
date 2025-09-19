import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() createNotificationDto: any) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Get()
  async getAllNotifications() {
    return this.notificationsService.getAllNotifications();
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return this.notificationsService.getNotificationById(id);
  }
}