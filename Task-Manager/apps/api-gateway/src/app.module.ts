import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [HttpModule, AuthModule, TasksModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
