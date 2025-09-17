import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TaskService } from './services/task.service';

@Controller()
export class TasksMessageController {
  constructor(private readonly tasksService: TaskService) {}

  @MessagePattern('get_task')
  async getTask(data: { taskId: string }) {
    try {
      const task = await this.tasksService.findOne(data.taskId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        assignedUserIds: task.assignedUsers?.map(user => user.id) || [],
      };
    } catch (error) {
      return { error: 'Task not found' };
    }
  }

  @MessagePattern('task_created')
  async handleTaskCreated(data: any) {
    // Handle task created event
    console.log('Task created event received:', data);
    return { success: true };
  }

  @MessagePattern('task_updated')
  async handleTaskUpdated(data: any) {
    // Handle task updated event
    console.log('Task updated event received:', data);
    return { success: true };
  }

  @MessagePattern('task_deleted')
  async handleTaskDeleted(data: { taskId: string }) {
    // Handle task deleted event
    console.log('Task deleted event received:', data.taskId);
    return { success: true };
  }
}