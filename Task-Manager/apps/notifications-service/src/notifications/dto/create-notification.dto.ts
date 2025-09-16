import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  taskId?: string;
}