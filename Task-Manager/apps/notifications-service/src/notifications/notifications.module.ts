import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controller/notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsMessageController } from './notifications-message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController, NotificationsMessageController],
  exports: [NotificationsService],
})
export class NotificationsModule {}