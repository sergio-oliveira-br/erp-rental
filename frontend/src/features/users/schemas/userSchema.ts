// frontend/src/features/users/schemas/userSchema.ts

import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone_number: z.string().min(8, 'Informe um número de telefone válido'),
  is_admin: z.boolean().default(false),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;