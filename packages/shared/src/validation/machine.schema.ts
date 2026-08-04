import { z } from 'zod';

export const createMachineSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  code: z.string().min(1, 'Kód je povinný'),
  description: z.string().optional(),
  lineId: z.string().uuid(),
  status: z.enum(['operational', 'maintenance', 'breakdown', 'decommissioned']).default('operational'),
  commissionedAt: z.string().datetime().optional(),
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
