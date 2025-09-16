import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Sua tarefa foi atualizada com sucesso',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'ID do usuário destinatário',
    example: 'user123',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'ID da tarefa relacionada',
    example: 'task456',
  })
  @IsString()
  @IsOptional()
  taskId?: string;
}