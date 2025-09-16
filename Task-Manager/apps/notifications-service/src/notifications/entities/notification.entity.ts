import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Notification {
  @ApiProperty({
    description: 'ID único da notificação',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Sua tarefa foi atualizada',
  })
  @Column()
  message: string;

  @ApiProperty({
    description: 'ID do usuário destinatário',
    example: 'user123',
    required: false,
  })
  @Column({ nullable: true })
  userId: string;

  @ApiProperty({
    description: 'ID da tarefa relacionada',
    example: 'task456',
    required: false,
  })
  @Column({ nullable: true })
  taskId: string;

  @ApiProperty({
    description: 'Data de criação da notificação',
    example: '2025-09-16T15:19:15.330Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}