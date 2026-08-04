export const WORK_RECORD_CATEGORIES = {
  FAILURE: 'failure',
  MAINTENANCE: 'maintenance',
  ADJUSTMENT: 'adjustment',
  CLEANING: 'cleaning',
  INSPECTION: 'inspection',
  MACHINE_SETUP: 'machine_setup',
  OTHER: 'other',
} as const;

export type WorkRecordCategory =
  (typeof WORK_RECORD_CATEGORIES)[keyof typeof WORK_RECORD_CATEGORIES];

export const CATEGORY_LABELS: Record<WorkRecordCategory, string> = {
  failure: 'Porucha',
  maintenance: 'Údržba',
  adjustment: 'Seřízení',
  cleaning: 'Čištění',
  inspection: 'Kontrola',
  machine_setup: 'Nastavení stroje',
  other: 'Ostatní',
};

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  critical: 'Kritická',
};

export const WORK_RECORD_STATUSES = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type WorkRecordStatus =
  (typeof WORK_RECORD_STATUSES)[keyof typeof WORK_RECORD_STATUSES];

export const MACHINE_STATUSES = {
  OPERATIONAL: 'operational',
  MAINTENANCE: 'maintenance',
  BREAKDOWN: 'breakdown',
  DECOMMISSIONED: 'decommissioned',
} as const;

export type MachineStatus = (typeof MACHINE_STATUSES)[keyof typeof MACHINE_STATUSES];
