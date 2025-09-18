import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto para login
  async login(@Body() loginDto: any) {
    // Lógica de login
    return { message: 'Login endpoint' };
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 registros por hora
  async register(@Body() registerDto: any) {
    // Lógica de registro
    return { message: 'Register endpoint' };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refresh tokens por minuto
  async refresh(@Body() refreshDto: any) {
    // Lógica de refresh token
    return { message: 'Refresh token endpoint' };
  }
}