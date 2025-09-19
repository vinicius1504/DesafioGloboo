import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email ou username é obrigatório")
    .min(3, "Deve ter pelo menos 3 caracteres"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Username é obrigatório")
    .min(3, "Username deve ter pelo menos 3 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>