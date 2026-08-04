import { z } from 'zod';

export const createWorkshopSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  code: z.string().min(1, 'Kód je povinný').max(10),
  description: z.string().optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;

export const createProductionLineSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  code: z.string().optional(),
  workshopId: z.string().uuid(),
});

export type CreateProductionLineInput = z.infer<typeof createProductionLineSchema>;
