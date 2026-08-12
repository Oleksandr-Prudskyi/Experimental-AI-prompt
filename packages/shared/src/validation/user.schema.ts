import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Neplatný e-mail'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  fullName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  roleId: z.string().uuid(),
  workshopId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
