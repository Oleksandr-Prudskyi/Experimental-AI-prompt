export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  isActive: boolean;
  roleId: string;
  workshopId: string | null;
  shiftId: string | null;
  role?: Role;
  workshop?: Workshop;
  shift?: Shift;
  permissions?: UserPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
}

export interface UserPermission {
  id: string;
  userId: string;
  permission: string;
  grantedBy: string;
  createdAt: string;
}

import type { Workshop } from './workshop';
import type { Shift } from './work-record';
