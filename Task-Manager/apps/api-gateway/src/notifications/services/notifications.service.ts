import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  private readonly notificationsServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.notificationsServiceUrl = process.env.NOTIFICATIONS_SERVICE_URL || 'http://notifications-service:3004';
  }

  async createNotification(createNotificationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationsServiceUrl}/notifications`, createNotificationDto)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async getAllNotifications() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationsServiceUrl}/notifications`)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async getNotificationById(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationsServiceUrl}/notifications/${id}`)
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }
}