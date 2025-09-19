import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
  }

  async register(registerDto: any) {
    try {
      console.log(`Calling auth service at: ${this.authServiceUrl}/auth/register`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto, {
          timeout: 10000,
        })
      );
      return response.data;
    } catch (error) {
      console.error('Auth service error:', {
        message: error.message,
        code: error.code,
        address: error.address,
        port: error.port,
        errno: error.errno
      });
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async login(loginDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto, {
          timeout: 10000,
        })
      );
      return response.data;
    } catch (error) {
      console.error('Auth service error:', {
        message: error.message,
        code: error.code,
        address: error.address,
        port: error.port,
        errno: error.errno
      });
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  async refresh(refreshDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/refresh`, refreshDto)
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