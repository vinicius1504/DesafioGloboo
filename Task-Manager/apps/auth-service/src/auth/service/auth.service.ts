import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/service/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { RabbitMQService, AuthEvent } from './rabbitmq.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const user = await this.usersService.create(registerDto);
      const userResponse = new UserResponseDto(user);

      // Publish user registration event
      const authEvent: AuthEvent = {
        eventType: 'user.registered',
        userId: user.id,
        data: {
          email: user.email,
          username: user.username,
        },
        timestamp: new Date(),
      };
      await this.rabbitMQService.publishAuthEvent(authEvent);

      return this.generateTokens(userResponse);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error creating user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { login, password } = loginDto;

    // Find user by email or username
    let user = await this.usersService.findByEmail(login);
    if (!user) {
      user = await this.usersService.findByUsername(login);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userResponse = new UserResponseDto(user);

    // Publish user login event
    const authEvent: AuthEvent = {
      eventType: 'user.logged_in',
      userId: user.id,
      data: {
        email: user.email,
        username: user.username,
        loginTime: new Date().toISOString(),
      },
      timestamp: new Date(),
    };
    await this.rabbitMQService.publishAuthEvent(authEvent);

    return this.generateTokens(userResponse);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userResponse = new UserResponseDto(user);
      return this.generateTokens(userResponse);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserResponseDto): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpireTime(this.configService.get<string>('JWT_EXPIRES_IN', '15m'));

    return new AuthResponseDto(user, accessToken, refreshToken, expiresIn);
  }

  private parseExpireTime(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 15 * 60;
    }
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}
