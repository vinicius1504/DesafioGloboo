import { Module } from '@nestjs/common';
import { RabbitMQService } from '../auth/service/rabbitmq.service';

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class SharedModule {}