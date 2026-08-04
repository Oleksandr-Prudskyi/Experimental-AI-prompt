export interface Machine {
  id: string;
  name: string;
  code: string;
  description: string | null;
  photoUrl: string | null;
  status: string;
  lineId: string;
  commissionedAt: string | null;
  line?: ProductionLine;
  responsibles?: MachineResponsible[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  code: string | null;
  workshopId: string;
  workshop?: import('./workshop').Workshop;
  machines?: Machine[];
  createdAt: string;
  updatedAt: string;
}

export interface MachineResponsible {
  machineId: string;
  userId: string;
  role: string;
  createdAt: string;
}
