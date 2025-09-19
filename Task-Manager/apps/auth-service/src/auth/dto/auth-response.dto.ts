import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';


export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de renovação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Informações do usuário',
  })

  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  constructor(
    user: UserResponseDto,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) {
    this.user = user;
    this.access_token = accessToken;
    this.refresh_token = refreshToken;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
  }
}
