import { z } from 'zod';

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  errorMap: () => ({ message: 'Selecione uma prioridade válida' }),
});

export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], {
  errorMap: () => ({ message: 'Selecione um status válido' }),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título não pode ter mais de 255 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição não pode ter mais de 2000 caracteres')
    .optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: 'A data de vencimento não pode ser no passado',
      }
    ),
  priority: taskPriorityEnum.default('MEDIUM'),
  status: taskStatusEnum.default('TODO'),
  assignedUserIds: z
    .array(z.string().uuid('ID de usuário inválido'))
    .optional()
    .default([]),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título não pode ter mais de 255 caracteres')
    .optional(),
  description: z
    .string()
    .max(2000, 'Descrição não pode ter mais de 2000 caracteres')
    .optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: 'A data de vencimento não pode ser no passado',
      }
    ),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  assignedUserIds: z
    .array(z.string().uuid('ID de usuário inválido'))
    .optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário não pode estar vazio')
    .min(3, 'Comentário deve ter pelo menos 3 caracteres')
    .max(1000, 'Comentário não pode ter mais de 1000 caracteres'),
});

export const taskFilterSchema = z.object({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assignedToMe: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type TaskFilterData = z.infer<typeof taskFilterSchema>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;