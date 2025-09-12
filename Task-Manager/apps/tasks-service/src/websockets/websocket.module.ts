import { Module } from '@nestjs/common';
import { TaskGateway } from './task.gateway';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [TaskGateway],
  exports: [TaskGateway],
})
export class WebSocketModule {}