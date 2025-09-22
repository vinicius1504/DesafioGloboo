import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { WebSocketModule } from './websockets/websocket.module';
import { AuditModule } from './audit/audit.module';
import { Task } from './tasks/entities/task.entity';
import { Comment } from './comments/entities/comment.entity';
import { User } from './users/entities/user.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { dataSourceOptions } from './config/data-source';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Task, Comment, User, AuditLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    CommentsModule,
    UsersModule,
    SharedModule,
    WebSocketModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
