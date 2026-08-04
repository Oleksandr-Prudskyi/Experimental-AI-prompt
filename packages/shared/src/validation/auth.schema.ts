import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Neplatný e-mail'),
  password: z.string().min(1, 'Heslo je povinné'),
});

export type LoginInput = z.infer<typeof loginSchema>;
