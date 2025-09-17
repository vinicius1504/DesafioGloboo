import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksController } from './controller/tasks.controller';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [HttpModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}