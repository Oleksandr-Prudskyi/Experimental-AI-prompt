export interface WorkRecord {
  id: string;
  authorId: string;
  machineId: string;
  lineId: string;
  shiftId: string | null;
  category: string;
  date: string;
  startTime: string;
  endTime: string | null;
  durationMin: number | null;
  description: string;
  downtimeMin: number | null;
  cause: string | null;
  maintenanceDone: string | null;
  replacedParts: string | null;
  requiredParts: string | null;
  recommendations: string | null;
  priority: string;
  status: string;
  isDraft: boolean;
  author?: import('./user').User;
  machine?: import('./machine').Machine;
  line?: import('./machine').ProductionLine;
  shift?: Shift;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkRecordTemplate {
  id: string;
  authorId: string;
  name: string;
  category: string;
  machineId: string | null;
  description: string | null;
  defaultValues: Record<string, unknown>;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
