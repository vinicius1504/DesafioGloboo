import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from '../users/service/users.service';

@Controller()
export class AuthMessageController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('get_user')
  async getUser(data: { userId: string }) {
    try {
      const user = await this.usersService.findOne(data.userId);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
      };
    } catch (error) {
      return { error: 'User not found' };
    }
  }

  @MessagePattern('validate_token')
  async validateToken(data: { token: string }) {
    // Implementar validação de token JWT
    // Por simplicidade, retornando true por enquanto
    return { valid: true };
  }
}