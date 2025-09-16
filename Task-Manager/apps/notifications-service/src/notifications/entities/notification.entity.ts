import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  taskId: string;

  @CreateDateColumn()
  createdAt: Date;
}