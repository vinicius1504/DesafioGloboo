import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.tasksServiceUrl = process.env.TASKS_SERVICE_URL || 'http://tasks-service:3003';
  }

  async createTask(createTaskDto: any, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/api/tasks`, createTaskDto, {
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async getAllTasks(pagination: any, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/api/tasks`, {
          params: pagination,
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async getTaskById(id: string, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/api/tasks/${id}`, {
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async updateTask(id: string, updateTaskDto: any, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.tasksServiceUrl}/api/tasks/${id}`, updateTaskDto, {
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async deleteTask(id: string, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.tasksServiceUrl}/api/tasks/${id}`, {
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async createComment(taskId: string, createCommentDto: any, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/api/comments/task/${taskId}`, createCommentDto, {
          headers: { Authorization: authHeader }
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async getCommentsByTask(taskId: string, pagination: any, authHeader: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/api/comments/task/${taskId}`, {
          params: pagination,
          headers: { Authorization: authHeader }
        })
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