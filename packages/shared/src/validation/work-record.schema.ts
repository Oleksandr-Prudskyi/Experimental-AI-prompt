import { z } from 'zod';

export const createWorkRecordSchema = z.object({
  machineId: z.string().uuid(),
  lineId: z.string().uuid(),
  shiftId: z.string().uuid().optional(),
  category: z.enum([
    'failure', 'maintenance', 'adjustment', 'cleaning',
    'inspection', 'machine_setup', 'other',
  ]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  downtimeMin: z.number().int().min(0).optional(),
  description: z.string().min(1, 'Popis je povinný'),
  cause: z.string().optional(),
  maintenanceDone: z.string().optional(),
  replacedParts: z.string().optional(),
  requiredParts: z.string().optional(),
  recommendations: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'resolved', 'closed']).optional(),
  isDraft: z.boolean().default(false),
});

export const updateWorkRecordSchema = createWorkRecordSchema.partial();

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type UpdateWorkRecordInput = z.infer<typeof updateWorkRecordSchema>;
