# Evidence Phase 1 — MVP Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core production management app — monorepo, auth, users with roles/permissions, organization structure (workshops/lines/machines), work records (evidence práce), dashboard, audit log, and trash — with a calming glassmorphism UI.

**Architecture:** pnpm monorepo with three packages: `@evidence/shared` (types + Zod validation), `apps/api` (NestJS 11 REST backend), `apps/web` (React 19 + Vite 6 SPA). PostgreSQL via Prisma ORM. JWT auth with refresh tokens. All UI uses glassmorphism cards, gradient accents, and smooth 250–350ms animations.

**Tech Stack:** React 19, Vite 6, TypeScript 5.5+, React Router 7, TanStack Query v5, Zustand, Tailwind CSS 4, shadcn/ui, NestJS 11, Prisma 6, PostgreSQL 16, Redis 7, Docker Compose, Vitest

## Global Constraints

- TypeScript strict mode everywhere
- UI text in Czech, code identifiers in English
- Minimal comments — only when WHY is non-obvious
- All interactive elements: `transition-all duration-300`
- No `prefers-reduced-motion` guards — animations always on
- Mobile-first responsive: Tailwind breakpoints `md:768px`, `lg:1024px`, `xl:1280px`
- API versioned under `/api/v1/`
- Unified API response: `{ data, meta, error }`
- Soft delete on all main entities (`deleted_at` timestamp)
- pnpm only (no npm/yarn)
- Node.js 20 LTS
- Seed emails: `admin@evidence.local`, `mistr@evidence.local`, password: `admin`

---

## File Structure

```
evidence/
├── packages/shared/
│   ├── src/
│   │   ├── types/          # user.ts, role.ts, workshop.ts, machine.ts,
│   │   │                   # production-line.ts, work-record.ts, shift.ts,
│   │   │                   # comment.ts, attachment.ts, audit-log.ts, api.ts,
│   │   │                   # settings.ts, index.ts
│   │   ├── constants/      # roles.ts, permissions.ts, categories.ts, index.ts
│   │   ├── validation/     # auth.schema.ts, user.schema.ts, workshop.schema.ts,
│   │   │                   # machine.schema.ts, work-record.schema.ts, index.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
├── apps/api/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   └── env.validation.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── seed.ts
│   │   ├── common/
│   │   │   ├── decorators/current-user.decorator.ts
│   │   │   ├── decorators/roles.decorator.ts
│   │   │   ├── decorators/permissions.decorator.ts
│   │   │   ├── guards/jwt-auth.guard.ts
│   │   │   ├── guards/roles.guard.ts
│   │   │   ├── guards/permissions.guard.ts
│   │   │   ├── interceptors/audit.interceptor.ts
│   │   │   ├── interceptors/response.interceptor.ts
│   │   │   ├── filters/http-exception.filter.ts
│   │   │   ├── pipes/zod-validation.pipe.ts
│   │   │   └── middleware/soft-delete.middleware.ts
│   │   └── modules/
│   │       ├── auth/        # module, controller, service, strategies/, dto/
│   │       ├── users/       # module, controller, service, dto/
│   │       ├── workshops/   # module, controller, service, dto/
│   │       ├── production-lines/
│   │       ├── machines/    # module, controller, service, dto/
│   │       ├── teams/
│   │       ├── work-records/# module, controller, service, dto/
│   │       ├── shifts/
│   │       ├── comments/
│   │       ├── audit-log/
│   │       ├── trash/
│   │       └── settings/
│   ├── test/
│   │   ├── auth.e2e-spec.ts
│   │   ├── users.e2e-spec.ts
│   │   ├── workshops.e2e-spec.ts
│   │   ├── machines.e2e-spec.ts
│   │   ├── work-records.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── vitest.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── apps/web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── workshops.ts
│   │   │   ├── machines.ts
│   │   │   ├── production-lines.ts
│   │   │   ├── work-records.ts
│   │   │   ├── shifts.ts
│   │   │   ├── audit-log.ts
│   │   │   └── trash.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── sidebar.store.ts
│   │   │   └── theme.store.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── usePermissions.ts
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── SidebarNav.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── RightPanel.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── shared/
│   │   │       ├── GlassCard.tsx
│   │   │       ├── GradientButton.tsx
│   │   │       ├── DataTable.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── ConfirmDialog.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   └── components/
│   │   │   ├── evidence/
│   │   │   │   ├── EvidencePage.tsx
│   │   │   │   ├── components/
│   │   │   │   └── forms/
│   │   │   ├── machines/
│   │   │   │   ├── MachinesPage.tsx
│   │   │   │   ├── MachineDetailPage.tsx
│   │   │   │   └── components/
│   │   │   └── admin/
│   │   │       ├── UsersPage.tsx
│   │   │       ├── WorkshopsPage.tsx
│   │   │       ├── ShiftsPage.tsx
│   │   │       ├── AuditLogPage.tsx
│   │   │       └── TrashPage.tsx
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   └── cn.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json         # shadcn/ui config
│   └── package.json
│
├── docker/
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── .env.example
├── .gitignore
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

---

### Task 1: Monorepo Scaffold + Docker

**Files:**
- Create: `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `.gitignore`, `.prettierrc`, `.env.example`
- Create: `docker/docker-compose.dev.yml`
- Create: `apps/api/` (NestJS scaffold)
- Create: `apps/web/` (Vite React scaffold)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: working monorepo where `pnpm install` succeeds, `pnpm dev` starts both apps, `docker compose up` starts PostgreSQL + Redis

- [ ] **Step 1: Initialize git and create root package.json**

```bash
cd A:\Studium_a_vyvoj\Softwarovy_vyvoj\Projects\experiments\evidence
git init
```

```json
// package.json
{
  "name": "evidence",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\""
  },
  "devDependencies": {
    "prettier": "^3.3.0",
    "turbo": "^2.4.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

- [ ] **Step 2: Create workspace and turbo config**

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 3: Create .gitignore, .prettierrc, .env.example**

```gitignore
# .gitignore
node_modules/
dist/
.turbo/
*.env
!.env.example
.DS_Store
coverage/
*.log
.vite/
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

```env
# .env.example
DATABASE_URL=postgresql://evidence:evidence@localhost:5432/evidence
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production-use-64-char-random-string
JWT_REFRESH_SECRET=change-me-refresh-secret-64-chars-random
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 4: Create Docker Compose for dev services**

```yaml
# docker/docker-compose.dev.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: evidence
      POSTGRES_PASSWORD: evidence
      POSTGRES_DB: evidence
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evidence"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

- [ ] **Step 5: Scaffold NestJS API app**

```bash
cd apps
npx @nestjs/cli new api --package-manager pnpm --skip-git --strict
cd api
pnpm add @nestjs/config class-validator class-transformer
pnpm add -D vitest @vitest/coverage-v8
```

Update `apps/api/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: Scaffold Vite React app**

```bash
cd apps
pnpm create vite web --template react-ts
cd web
pnpm add react-router-dom @tanstack/react-query zustand axios
pnpm add -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

Update `apps/web/package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 7: Install dependencies and verify**

```bash
cd A:\Studium_a_vyvoj\Softwarovy_vyvoj\Projects\experiments\evidence
cp .env.example .env
pnpm install
docker compose -f docker/docker-compose.dev.yml up -d
pnpm dev
```

Expected: both apps start — API on port 3001, web on port 5173. PostgreSQL on 5432, Redis on 6379.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold monorepo with NestJS API and Vite React frontend"
```

---

### Task 2: Shared Package (@evidence/shared)

**Files:**
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types/*.ts` (all type files)
- Create: `packages/shared/src/constants/*.ts`
- Create: `packages/shared/src/validation/*.ts` (Zod schemas)
- Create: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `@evidence/shared` package exporting types (`User`, `Role`, `Workshop`, `Machine`, `WorkRecord`, etc.), constants (`ROLES`, `PERMISSIONS`, `WORK_RECORD_CATEGORIES`), and Zod schemas (`loginSchema`, `createUserSchema`, `createWorkRecordSchema`, etc.)

- [ ] **Step 1: Create shared package config**

```json
// packages/shared/package.json
{
  "name": "@evidence/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.1.0"
  }
}
```

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Create constants**

```typescript
// packages/shared/src/constants/roles.ts
export const ROLE_SLUGS = {
  ADMINISTRATOR: 'administrator',
  MISTR: 'mistr',
  SERIZOVAC: 'serizovac',
  VEDOUCI_VYROBY: 'vedouci_vyroby',
} as const;

export type RoleSlug = (typeof ROLE_SLUGS)[keyof typeof ROLE_SLUGS];

export const ROLE_NAMES: Record<RoleSlug, string> = {
  administrator: 'Administrátor',
  mistr: 'Mistr',
  serizovac: 'Seřizovač',
  vedouci_vyroby: 'Vedoucí výroby',
};

export const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  administrator: 100,
  mistr: 80,
  serizovac: 20,
  vedouci_vyroby: 10,
};
```

```typescript
// packages/shared/src/constants/permissions.ts
export const PERMISSIONS = {
  RECORDS_CREATE: 'records.create',
  RECORDS_EDIT_ALL: 'records.edit_all',
  RECORDS_DELETE: 'records.delete',
  MACHINES_MANAGE: 'machines.manage',
  WORKSHOPS_MANAGE: 'workshops.manage',
  TEAMS_MANAGE: 'teams.manage',
  USERS_MANAGE: 'users.manage',
  USERS_GRANT_PERMISSIONS: 'users.grant_permissions',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  CHAT_CREATE_CHANNEL: 'chat.create_channel',
  STATISTICS_VIEW_ALL: 'statistics.view_all',
  REPORTS_GENERATE: 'reports.generate',
  AUDIT_VIEW: 'audit.view',
  SETTINGS_MANAGE: 'settings.manage',
  TRASH_RESTORE: 'trash.restore',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  administrator: Object.values(PERMISSIONS),
  mistr: [
    PERMISSIONS.RECORDS_CREATE,
    PERMISSIONS.RECORDS_EDIT_ALL,
    PERMISSIONS.RECORDS_DELETE,
    PERMISSIONS.MACHINES_MANAGE,
    PERMISSIONS.WORKSHOPS_MANAGE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_GRANT_PERMISSIONS,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.CHAT_CREATE_CHANNEL,
    PERMISSIONS.STATISTICS_VIEW_ALL,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.TRASH_RESTORE,
  ],
  serizovac: [PERMISSIONS.RECORDS_CREATE],
  vedouci_vyroby: [PERMISSIONS.STATISTICS_VIEW_ALL, PERMISSIONS.REPORTS_GENERATE],
};
```

```typescript
// packages/shared/src/constants/categories.ts
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
```

```typescript
// packages/shared/src/constants/index.ts
export * from './roles';
export * from './permissions';
export * from './categories';
```

- [ ] **Step 3: Create types**

```typescript
// packages/shared/src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    cursor?: string;
    hasMore?: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

```typescript
// packages/shared/src/types/user.ts
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
  role?: Role;
  workshop?: Workshop;
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
```

```typescript
// packages/shared/src/types/workshop.ts
export interface Workshop {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  workshopId: string;
  workshop?: Workshop;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  createdAt: string;
}
```

```typescript
// packages/shared/src/types/machine.ts
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
```

```typescript
// packages/shared/src/types/work-record.ts
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
```

```typescript
// packages/shared/src/types/comment.ts
export interface Comment {
  id: string;
  authorId: string;
  entityType: string;
  entityId: string;
  content: string;
  author?: import('./user').User;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// packages/shared/src/types/audit-log.ts
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  user?: import('./user').User;
  createdAt: string;
}
```

```typescript
// packages/shared/src/types/settings.ts
export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedBy: string | null;
  updatedAt: string;
}

export interface BrandingSettings {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
}
```

```typescript
// packages/shared/src/types/index.ts
export type * from './api';
export type * from './user';
export type * from './workshop';
export type * from './machine';
export type * from './work-record';
export type * from './comment';
export type * from './audit-log';
export type * from './settings';
```

- [ ] **Step 4: Create Zod validation schemas**

```typescript
// packages/shared/src/validation/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Neplatný e-mail'),
  password: z.string().min(1, 'Heslo je povinné'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```typescript
// packages/shared/src/validation/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Neplatný e-mail'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  fullName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  roleId: z.string().uuid(),
  workshopId: z.string().uuid().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

```typescript
// packages/shared/src/validation/workshop.schema.ts
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
```

```typescript
// packages/shared/src/validation/machine.schema.ts
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
```

```typescript
// packages/shared/src/validation/work-record.schema.ts
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
  startTime: z.string(),
  endTime: z.string().optional(),
  description: z.string().min(1, 'Popis je povinný'),
  downtimeMin: z.number().int().min(0).optional(),
  cause: z.string().optional(),
  maintenanceDone: z.string().optional(),
  replacedParts: z.string().optional(),
  requiredParts: z.string().optional(),
  recommendations: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['draft', 'open', 'in_progress', 'resolved', 'closed']).default('open'),
  isDraft: z.boolean().default(false),
});

export const updateWorkRecordSchema = createWorkRecordSchema.partial();

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type UpdateWorkRecordInput = z.infer<typeof updateWorkRecordSchema>;
```

```typescript
// packages/shared/src/validation/index.ts
export * from './auth.schema';
export * from './user.schema';
export * from './workshop.schema';
export * from './machine.schema';
export * from './work-record.schema';
```

- [ ] **Step 5: Create root barrel export**

```typescript
// packages/shared/src/index.ts
export * from './types';
export * from './constants';
export * from './validation';
```

- [ ] **Step 6: Write test for shared package**

```typescript
// packages/shared/src/validation/__tests__/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { loginSchema, createUserSchema, createWorkRecordSchema } from '../index';

describe('loginSchema', () => {
  it('validates correct input', () => {
    const result = loginSchema.safeParse({
      email: 'admin@evidence.local',
      password: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'admin',
    });
    expect(result.success).toBe(false);
  });
});

describe('createUserSchema', () => {
  it('rejects password shorter than 8 chars', () => {
    const result = createUserSchema.safeParse({
      email: 'test@evidence.local',
      password: 'short',
      fullName: 'Test User',
      roleId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(false);
  });
});

describe('createWorkRecordSchema', () => {
  it('validates correct work record', () => {
    const result = createWorkRecordSchema.safeParse({
      machineId: '550e8400-e29b-41d4-a716-446655440000',
      lineId: '550e8400-e29b-41d4-a716-446655440001',
      category: 'failure',
      date: '2026-08-03',
      startTime: '08:00',
      description: 'Test porucha',
      priority: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createWorkRecordSchema.safeParse({
      machineId: '550e8400-e29b-41d4-a716-446655440000',
      lineId: '550e8400-e29b-41d4-a716-446655440001',
      category: 'invalid_category',
      date: '2026-08-03',
      startTime: '08:00',
      description: 'Test',
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 7: Run tests**

```bash
cd packages/shared
pnpm test
```

Expected: all 5 tests pass.

- [ ] **Step 8: Add shared package as dependency to api and web**

```bash
cd apps/api
pnpm add @evidence/shared@workspace:*

cd apps/web
pnpm add @evidence/shared@workspace:*
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add @evidence/shared package with types, constants, and Zod schemas"
```

---

### Task 3: Prisma Schema + Database Seed

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/prisma/seed.ts`

**Interfaces:**
- Consumes: `@evidence/shared` (ROLE_SLUGS, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS)
- Produces: `PrismaService` injectable via `PrismaModule` (global), full database schema with all Phase 1 tables, seed script creating admin + mistr users and default data

- [ ] **Step 1: Install Prisma**

```bash
cd apps/api
pnpm add @prisma/client
pnpm add -D prisma
npx prisma init
```

- [ ] **Step 2: Write Prisma schema**

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───

enum RoleSlug {
  administrator
  mistr
  serizovac
  vedouci_vyroby
}

enum PermissionEnum {
  records_create        @map("records.create")
  records_edit_all      @map("records.edit_all")
  records_delete        @map("records.delete")
  machines_manage       @map("machines.manage")
  workshops_manage      @map("workshops.manage")
  teams_manage          @map("teams.manage")
  users_manage          @map("users.manage")
  users_grant_permissions @map("users.grant_permissions")
  announcements_manage  @map("announcements.manage")
  chat_create_channel   @map("chat.create_channel")
  statistics_view_all   @map("statistics.view_all")
  reports_generate      @map("reports.generate")
  audit_view            @map("audit.view")
  settings_manage       @map("settings.manage")
  trash_restore         @map("trash.restore")
}

enum WorkRecordCategory {
  failure
  maintenance
  adjustment
  cleaning
  inspection
  machine_setup
  other
}

enum Priority {
  low
  medium
  high
  critical
}

enum WorkRecordStatus {
  draft
  open
  in_progress
  resolved
  closed
}

enum MachineStatus {
  operational
  maintenance
  breakdown
  decommissioned
}

enum AuditAction {
  create
  update
  delete
  restore
  login
  logout
}

// ─── MODELS ───

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        RoleSlug @unique
  description String?
  isSystem    Boolean  @default(true) @map("is_system")
  users       User[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("roles")
}

model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  passwordHash  String    @map("password_hash")
  fullName      String    @map("full_name")
  avatarUrl     String?   @map("avatar_url")
  phone         String?
  position      String?
  isActive      Boolean   @default(true) @map("is_active")
  roleId        String    @map("role_id") @db.Uuid
  workshopId    String?   @map("workshop_id") @db.Uuid
  deletedAt     DateTime? @map("deleted_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  role                Role              @relation(fields: [roleId], references: [id])
  workshop            Workshop?         @relation(fields: [workshopId], references: [id])
  permissions         UserPermission[]  @relation("UserPermissions")
  grantedPermissions  UserPermission[]  @relation("GrantedPermissions")
  workRecords         WorkRecord[]
  workRecordTemplates WorkRecordTemplate[]
  comments            Comment[]
  auditLogs           AuditLog[]
  machineResponsibles MachineResponsible[]
  teamMembers         TeamMember[]

  @@index([email])
  @@index([roleId])
  @@index([workshopId])
  @@map("users")
}

model UserPermission {
  id         String         @id @default(uuid()) @db.Uuid
  userId     String         @map("user_id") @db.Uuid
  permission PermissionEnum
  grantedBy  String         @map("granted_by") @db.Uuid
  createdAt  DateTime       @default(now()) @map("created_at")

  user    User @relation("UserPermissions", fields: [userId], references: [id])
  granter User @relation("GrantedPermissions", fields: [grantedBy], references: [id])

  @@unique([userId, permission])
  @@map("user_permissions")
}

model Workshop {
  id              String           @id @default(uuid()) @db.Uuid
  name            String
  code            String           @unique
  description     String?
  deletedAt       DateTime?        @map("deleted_at")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  users           User[]
  productionLines ProductionLine[]
  teams           Team[]

  @@map("workshops")
}

model ProductionLine {
  id          String    @id @default(uuid()) @db.Uuid
  workshopId  String    @map("workshop_id") @db.Uuid
  name        String
  code        String?
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  workshop    Workshop  @relation(fields: [workshopId], references: [id])
  machines    Machine[]
  workRecords WorkRecord[]

  @@map("production_lines")
}

model Machine {
  id              String        @id @default(uuid()) @db.Uuid
  lineId          String        @map("line_id") @db.Uuid
  name            String
  code            String        @unique
  description     String?
  photoUrl        String?       @map("photo_url")
  status          MachineStatus @default(operational)
  commissionedAt  DateTime?     @map("commissioned_at")
  deletedAt       DateTime?     @map("deleted_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  line            ProductionLine       @relation(fields: [lineId], references: [id])
  responsibles    MachineResponsible[]
  workRecords     WorkRecord[]

  @@map("machines")
}

model MachineResponsible {
  machineId String   @map("machine_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  role      String
  createdAt DateTime @default(now()) @map("created_at")

  machine Machine @relation(fields: [machineId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@id([machineId, userId])
  @@map("machine_responsibles")
}

model Team {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  workshopId  String    @map("workshop_id") @db.Uuid
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  workshop Workshop     @relation(fields: [workshopId], references: [id])
  members  TeamMember[]

  @@map("teams")
}

model TeamMember {
  teamId    String   @map("team_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  team Team @relation(fields: [teamId], references: [id])
  user User @relation(fields: [userId], references: [id])

  @@id([teamId, userId])
  @@map("team_members")
}

model Shift {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  startTime String   @map("start_time")
  endTime   String   @map("end_time")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  workRecords WorkRecord[]

  @@map("shifts")
}

model WorkRecord {
  id               String             @id @default(uuid()) @db.Uuid
  authorId         String             @map("author_id") @db.Uuid
  machineId        String             @map("machine_id") @db.Uuid
  lineId           String             @map("line_id") @db.Uuid
  shiftId          String?            @map("shift_id") @db.Uuid
  category         WorkRecordCategory
  date             DateTime           @db.Date
  startTime        String             @map("start_time")
  endTime          String?            @map("end_time")
  durationMin      Int?               @map("duration_min")
  description      String
  downtimeMin      Int?               @map("downtime_min")
  cause            String?
  maintenanceDone  String?            @map("maintenance_done")
  replacedParts    String?            @map("replaced_parts")
  requiredParts    String?            @map("required_parts")
  recommendations  String?
  priority         Priority           @default(medium)
  status           WorkRecordStatus   @default(open)
  isDraft          Boolean            @default(false) @map("is_draft")
  deletedAt        DateTime?          @map("deleted_at")
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  author  User           @relation(fields: [authorId], references: [id])
  machine Machine        @relation(fields: [machineId], references: [id])
  line    ProductionLine @relation(fields: [lineId], references: [id])
  shift   Shift?         @relation(fields: [shiftId], references: [id])

  @@index([date, machineId, authorId, category])
  @@index([authorId])
  @@index([machineId])
  @@map("work_records")
}

model WorkRecordTemplate {
  id            String             @id @default(uuid()) @db.Uuid
  authorId      String             @map("author_id") @db.Uuid
  name          String
  category      WorkRecordCategory
  machineId     String?            @map("machine_id") @db.Uuid
  description   String?
  defaultValues Json               @default("{}") @map("default_values")
  createdAt     DateTime           @default(now()) @map("created_at")

  author User @relation(fields: [authorId], references: [id])

  @@map("work_record_templates")
}

model Comment {
  id         String    @id @default(uuid()) @db.Uuid
  authorId   String    @map("author_id") @db.Uuid
  entityType String    @map("entity_type")
  entityId   String    @map("entity_id") @db.Uuid
  content    String
  deletedAt  DateTime? @map("deleted_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])

  @@index([entityType, entityId])
  @@map("comments")
}

model AuditLog {
  id         String      @id @default(uuid()) @db.Uuid
  userId     String      @map("user_id") @db.Uuid
  action     AuditAction
  entityType String      @map("entity_type")
  entityId   String      @map("entity_id") @db.Uuid
  oldValue   Json?       @map("old_value")
  newValue   Json?       @map("new_value")
  metadata   Json?
  createdAt  DateTime    @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([entityType, entityId, createdAt])
  @@index([userId, createdAt])
  @@map("audit_logs")
}

model Setting {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique
  value     Json
  updatedBy String?  @map("updated_by") @db.Uuid
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}
```

- [ ] **Step 3: Create PrismaService and PrismaModule**

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Write seed script**

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient, RoleSlug } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { slug: RoleSlug.administrator },
      update: {},
      create: { name: 'Administrátor', slug: RoleSlug.administrator, description: 'Plný přístup k systému' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.mistr },
      update: {},
      create: { name: 'Mistr', slug: RoleSlug.mistr, description: 'Výrobní správce' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.serizovac },
      update: {},
      create: { name: 'Seřizovač', slug: RoleSlug.serizovac, description: 'Operátor strojů' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.vedouci_vyroby },
      update: {},
      create: { name: 'Vedoucí výroby', slug: RoleSlug.vedouci_vyroby, description: 'Analytik výroby' },
    }),
  ]);

  const adminRole = roles[0];
  const mistrRole = roles[1];
  const passwordHash = await bcrypt.hash('admin', 12);

  await prisma.user.upsert({
    where: { email: 'admin@evidence.local' },
    update: {},
    create: {
      email: 'admin@evidence.local',
      passwordHash,
      fullName: 'Admin',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mistr@evidence.local' },
    update: {},
    create: {
      email: 'mistr@evidence.local',
      passwordHash,
      fullName: 'Hlavní Mistr',
      roleId: mistrRole.id,
    },
  });

  await prisma.shift.createMany({
    data: [
      { name: 'Ranní', startTime: '06:00', endTime: '14:00' },
      { name: 'Odpolední', startTime: '14:00', endTime: '22:00' },
      { name: 'Noční', startTime: '22:00', endTime: '06:00' },
    ],
    skipDuplicates: true,
  });

  await prisma.setting.upsert({
    where: { key: 'branding' },
    update: {},
    create: {
      key: 'branding',
      value: { companyName: 'Evidence', logoUrl: null, primaryColor: '#6366f1' },
    },
  });

  console.log('Seed complete:');
  console.log('  Admin: admin@evidence.local / admin');
  console.log('  Mistr: mistr@evidence.local / admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 5: Add prisma scripts to api package.json**

Add to `apps/api/package.json` scripts:
```json
{
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "ts-node prisma/seed.ts",
  "prisma:studio": "prisma studio"
}
```

Add seed config to `apps/api/package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Install bcrypt:
```bash
cd apps/api
pnpm add bcrypt
pnpm add -D @types/bcrypt ts-node
```

- [ ] **Step 6: Run migration and seed**

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

Expected: migration succeeds, seed prints admin/mistr credentials.

- [ ] **Step 7: Register PrismaModule in AppModule**

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema with all Phase 1 tables and seed script"
```

---

### Task 4: NestJS Auth Module (JWT + Refresh Tokens)

**Files:**
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/modules/auth/strategies/local.strategy.ts`
- Create: `apps/api/src/modules/auth/dto/login.dto.ts`
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`
- Create: `apps/api/src/common/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/common/interceptors/response.interceptor.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/pipes/zod-validation.pipe.ts`

**Interfaces:**
- Consumes: `PrismaService`, `@evidence/shared` (loginSchema, LoginInput)
- Produces: `AuthModule` with endpoints `POST /api/v1/auth/login` (returns `{ accessToken, user }`), `POST /api/v1/auth/refresh` (cookie-based), `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`. `JwtAuthGuard` for protecting routes. `@CurrentUser()` decorator returning user object. `ResponseInterceptor` wrapping responses in `{ data }`. `HttpExceptionFilter` returning `{ error: { code, message } }`.

- [ ] **Step 1: Install auth dependencies**

```bash
cd apps/api
pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt passport-local bcrypt
pnpm add -D @types/passport-jwt @types/passport-local
```

- [ ] **Step 2: Write ZodValidationPipe**

```typescript
// apps/api/src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const key = err.path.join('.');
        if (!details[key]) details[key] = [];
        details[key].push(err.message);
      });
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Chyba validace', details });
    }
    return result.data;
  }
}
```

- [ ] **Step 3: Write HttpExceptionFilter and ResponseInterceptor**

```typescript
// apps/api/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'object'
        ? { code: (exceptionResponse as any).code || 'ERROR', message: (exceptionResponse as any).message || exception.message, details: (exceptionResponse as any).details }
        : { code: 'ERROR', message: exceptionResponse };

    response.status(status).json({ error });
  }
}
```

```typescript
// apps/api/src/common/interceptors/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data) return data;
        return { data };
      }),
    );
  }
}
```

- [ ] **Step 4: Write CurrentUser decorator**

```typescript
// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

- [ ] **Step 5: Write JwtAuthGuard**

```typescript
// apps/api/src/common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 6: Write AuthService**

```typescript
// apps/api/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Neplatné přihlašovací údaje');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Neplatné přihlašovací údaje');
    }
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role.slug };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const { passwordHash, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  async refreshTokens(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });
      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Neplatný token');
      }
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Neplatný refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        workshop: true,
        permissions: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
```

- [ ] **Step 7: Write JWT and Local strategies**

```typescript
// apps/api/src/modules/auth/strategies/local.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    return this.authService.validateUser(email, password);
  }
}
```

```typescript
// apps/api/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, permissions: true },
    });
    if (!user || !user.isActive || user.deletedAt) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
```

- [ ] **Step 8: Write AuthController**

```typescript
// apps/api/src/modules/auth/auth.controller.ts
import { Controller, Post, Get, UseGuards, Body, Res, Req, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { loginSchema, LoginInput } from '@evidence/shared';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  async login(
    @Body(new ZodValidationPipe(loginSchema)) _body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Refresh token chybí' } });
      return;
    }
    const result = await this.authService.refreshTokens(token);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Odhlášení úspěšné' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
```

- [ ] **Step 9: Write AuthModule**

```typescript
// apps/api/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 10: Register AuthModule in AppModule, add global pipes/filters**

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

- [ ] **Step 11: Update main.ts with cookie parser and CORS**

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

```bash
cd apps/api
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

- [ ] **Step 12: Test auth endpoints manually**

```bash
# Start API
cd apps/api && pnpm dev

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evidence.local","password":"admin"}' \
  -c cookies.txt

# Test me endpoint (use token from login response)
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Test refresh
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -b cookies.txt -c cookies.txt
```

Expected: login returns `{ data: { accessToken, user } }`, me returns user profile, refresh returns new tokens.

- [ ] **Step 13: Commit**

```bash
git add .
git commit -m "feat: add JWT auth with login, refresh, logout, and me endpoints"
```

---

### Task 5: Frontend Scaffold + Auth UI

**Files:**
- Create: `apps/web/vite.config.ts`, `apps/web/tailwind.config.ts`
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/app/App.tsx`, `apps/web/src/app/router.tsx`, `apps/web/src/app/providers.tsx`
- Create: `apps/web/src/api/client.ts`, `apps/web/src/api/auth.ts`
- Create: `apps/web/src/stores/auth.store.ts`, `apps/web/src/stores/theme.store.ts`
- Create: `apps/web/src/hooks/useAuth.ts`
- Create: `apps/web/src/pages/auth/LoginPage.tsx`
- Create: `apps/web/src/lib/cn.ts`
- Create: `apps/web/src/main.tsx`
- Modify: `apps/web/index.html`

**Interfaces:**
- Consumes: Auth API endpoints from Task 4, `@evidence/shared` (loginSchema)
- Produces: Working React app with login page, auth store (Zustand), axios client with JWT interceptor (auto-refresh on 401), protected route wrapper, TanStack Query provider, theme store (dark/light)

- [ ] **Step 1: Configure Vite with Tailwind**

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 2: Create globals.css with Tailwind and glassmorphism base**

```css
/* apps/web/src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --animate-fade-in: fade-in 400ms ease-out forwards;
  --animate-fade-in-up: fade-in-up 400ms ease-out forwards;
  --animate-scale-in: scale-in 300ms ease-out forwards;
  --animate-shimmer: shimmer 1.5s ease infinite;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.bg-app-gradient {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%);
}

.dark .bg-app-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1a1033 50%, #0f172a 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-card {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(51, 65, 85, 0.3);
}
```

- [ ] **Step 3: Create cn utility**

```typescript
// apps/web/src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```bash
cd apps/web
pnpm add clsx tailwind-merge
```

- [ ] **Step 4: Create axios client with JWT interceptor**

```typescript
// apps/web/src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const { accessToken, user } = res.data.data;
        useAuthStore.getState().setAuth(accessToken, user);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
```

- [ ] **Step 5: Create auth API functions**

```typescript
// apps/web/src/api/auth.ts
import { api } from './client';
import type { LoginInput } from '@evidence/shared';
import type { User } from '@evidence/shared';

export const authApi = {
  login: (data: LoginInput) =>
    api.post<{ data: { accessToken: string; user: User } }>('/auth/login', data),

  refresh: () =>
    api.post<{ data: { accessToken: string; user: User } }>('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ data: User }>('/auth/me'),
};
```

- [ ] **Step 6: Create auth store (Zustand)**

```typescript
// apps/web/src/stores/auth.store.ts
import { create } from 'zustand';
import type { User } from '@evidence/shared';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
```

- [ ] **Step 7: Create theme store**

```typescript
// apps/web/src/stores/theme.store.ts
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem('evidence-theme') as Theme | null;
  const initial = stored || 'light';
  document.documentElement.classList.toggle('dark', initial === 'dark');

  return {
    theme: initial,
    toggle: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('evidence-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        return { theme: next };
      }),
    setTheme: (theme) => {
      localStorage.setItem('evidence-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },
  };
});
```

- [ ] **Step 8: Create LoginPage**

```tsx
// apps/web/src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@evidence/shared';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError('');
      const res = await authApi.login(data);
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Chyba přihlášení');
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
              Evidence
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Přihlášení do systému
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-sm text-rose-600 dark:text-rose-400 animate-scale-in">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                placeholder="email@evidence.local"
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-400 hover:to-violet-400 text-white font-medium py-2.5 shadow-md shadow-primary-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] active:duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

```bash
cd apps/web
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 9: Create router and providers**

```tsx
// apps/web/src/app/router.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { useAuthStore } from '@/stores/auth.store';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <div className="p-8 text-2xl">Dashboard (Phase 1)</div> },
    ],
  },
]);
```

```tsx
// apps/web/src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// apps/web/src/app/App.tsx
import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
```

- [ ] **Step 10: Update main.tsx and index.html**

```tsx
// apps/web/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```html
<!-- apps/web/index.html -->
<!DOCTYPE html>
<html lang="cs" class="">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Evidence</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Verify login flow**

```bash
pnpm dev
```

Open `http://localhost:5173/login`. Enter `admin@evidence.local` / `admin`. Expected: redirects to `/` showing "Dashboard (Phase 1)".

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: add React frontend with login page, auth store, and JWT interceptor"
```

---

### Task 6: App Layout + Design System Components

**Files:**
- Create: `apps/web/src/components/layout/AppLayout.tsx`
- Create: `apps/web/src/components/layout/Sidebar.tsx`
- Create: `apps/web/src/components/layout/SidebarNav.tsx`
- Create: `apps/web/src/components/layout/PageHeader.tsx`
- Create: `apps/web/src/components/layout/RightPanel.tsx`
- Create: `apps/web/src/components/layout/ThemeToggle.tsx`
- Create: `apps/web/src/components/shared/GlassCard.tsx`
- Create: `apps/web/src/components/shared/GradientButton.tsx`
- Create: `apps/web/src/components/shared/StatusBadge.tsx`
- Create: `apps/web/src/components/shared/EmptyState.tsx`
- Create: `apps/web/src/components/shared/ConfirmDialog.tsx`
- Create: `apps/web/src/stores/sidebar.store.ts`
- Create: `apps/web/src/hooks/usePermissions.ts`
- Modify: `apps/web/src/app/router.tsx` (wrap protected routes in AppLayout)

**Interfaces:**
- Consumes: `useAuthStore` (user, logout), `useThemeStore` (theme, toggle), `@evidence/shared` (ROLE_SLUGS, PERMISSIONS)
- Produces: `<AppLayout>` three-column layout component, `<GlassCard>`, `<GradientButton>`, `<StatusBadge>`, `<EmptyState>`, `<ConfirmDialog>`, `usePermissions()` hook returning `{ hasPermission, hasRole }`, `useSidebarStore`

- [ ] **Step 1: Create sidebar store**

```typescript
// apps/web/src/stores/sidebar.store.ts
import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),
}));
```

- [ ] **Step 2: Create usePermissions hook**

```typescript
// apps/web/src/hooks/usePermissions.ts
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_HIERARCHY, DEFAULT_ROLE_PERMISSIONS } from '@evidence/shared';
import type { RoleSlug, Permission } from '@evidence/shared';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (...roles: RoleSlug[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role.slug as RoleSlug);
  };

  const hasMinRole = (minRole: RoleSlug) => {
    if (!user?.role) return false;
    return (ROLE_HIERARCHY[user.role.slug as RoleSlug] || 0) >= ROLE_HIERARCHY[minRole];
  };

  const hasPermission = (permission: Permission) => {
    if (!user?.role) return false;
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role.slug] || [];
    if (rolePerms.includes(permission)) return true;
    const userPerms = user.permissions?.map((p) => p.permission) || [];
    return userPerms.includes(permission);
  };

  return { hasRole, hasMinRole, hasPermission, user };
}
```

- [ ] **Step 3: Create ThemeToggle**

```tsx
// apps/web/src/components/layout/ThemeToggle.tsx
import { useThemeStore } from '@/stores/theme.store';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="rounded-xl p-2 transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
      title={theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Create SidebarNav**

```tsx
// apps/web/src/components/layout/SidebarNav.tsx
import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';
import { cn } from '@/lib/cn';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: string;
  roles?: string[];
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Hlavní',
    items: [
      { label: 'Dashboard', path: '/', icon: '📊' },
      { label: 'Evidence práce', path: '/evidence', icon: '📋' },
      { label: 'Stroje', path: '/machines', icon: '⚙️' },
    ],
  },
  {
    title: 'Správa',
    items: [
      { label: 'Uživatelé', path: '/admin/users', icon: '👤', permission: PERMISSIONS.USERS_MANAGE },
      { label: 'Dílny / Týmy', path: '/admin/workshops', icon: '🏭', permission: PERMISSIONS.WORKSHOPS_MANAGE },
      { label: 'Směny', path: '/admin/shifts', icon: '🕐', permission: PERMISSIONS.SETTINGS_MANAGE },
      { label: 'Audit log', path: '/admin/audit', icon: '📜', permission: PERMISSIONS.AUDIT_VIEW },
      { label: 'Koš', path: '/admin/trash', icon: '🗑️', permission: PERMISSIONS.TRASH_RESTORE },
    ],
  },
];

export function SidebarNav() {
  const { hasPermission } = usePermissions();

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV_SECTIONS.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission as any),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              {section.title}
            </span>
            {visibleItems.map((item, i) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${i * 40}ms` }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 animate-fade-in',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/15 to-transparent text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50',
                  )
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 5: Create Sidebar**

```tsx
// apps/web/src/components/layout/Sidebar.tsx
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from './ThemeToggle';
import { authApi } from '@/api/auth';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col',
          'bg-white/50 dark:bg-slate-900/70 backdrop-blur-2xl',
          'border-r border-white/15 dark:border-slate-700/30',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
            Evidence
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="flex flex-col gap-2 p-3 border-t border-white/10 dark:border-slate-700/30">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role?.name}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300"
          >
            Odhlásit se
          </button>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 6: Create PageHeader**

```tsx
// apps/web/src/components/layout/PageHeader.tsx
import { useSidebarStore } from '@/stores/sidebar.store';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden rounded-xl p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300"
        >
          <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 7: Create RightPanel (placeholder for Phase 1)**

```tsx
// apps/web/src/components/layout/RightPanel.tsx
export function RightPanel() {
  return (
    <aside className="hidden xl:block w-[280px] shrink-0 p-4 border-l border-white/10 dark:border-slate-700/30 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Oznámení
          </h3>
          <p className="text-xs text-slate-400">Žádná nová oznámení</p>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 8: Create AppLayout**

```tsx
// apps/web/src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-app-gradient">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
```

- [ ] **Step 9: Create shared UI components**

```tsx
// apps/web/src/components/shared/GlassCard.tsx
import { cn } from '@/lib/cn';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function GlassCard({ children, hover = true, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/80 dark:hover:bg-slate-800/70',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

```tsx
// apps/web/src/components/shared/GradientButton.tsx
import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  children, variant = 'primary', size = 'md', className, ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300',
        'hover:scale-[1.02] active:scale-[0.98] active:duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-400 hover:to-violet-400 text-white shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30',
        variant === 'danger' && 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-md shadow-rose-500/25',
        variant === 'ghost' && 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

```tsx
// apps/web/src/components/shared/StatusBadge.tsx
import { cn } from '@/lib/cn';

const VARIANTS: Record<string, string> = {
  operational: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  breakdown: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  decommissioned: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  open: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-300', VARIANTS[status] || VARIANTS.draft)}>
      {label}
    </span>
  );
}
```

```tsx
// apps/web/src/components/shared/EmptyState.tsx
export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
```

```tsx
// apps/web/src/components/shared/ConfirmDialog.tsx
import { cn } from '@/lib/cn';
import { GradientButton } from './GradientButton';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = 'Potvrdit', variant = 'danger' }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative glass-card rounded-3xl p-6 max-w-md w-full shadow-xl animate-scale-in bg-white/85 dark:bg-slate-800/80 backdrop-blur-2xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <GradientButton variant="ghost" onClick={onClose}>Zrušit</GradientButton>
          <GradientButton variant={variant} onClick={onConfirm}>{confirmLabel}</GradientButton>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Update router to use AppLayout**

```tsx
// apps/web/src/app/router.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/auth.store';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <div>Dashboard (coming in Task 13)</div> },
      { path: '/evidence', element: <div>Evidence (coming in Task 12)</div> },
      { path: '/machines', element: <div>Machines (coming in Task 10)</div> },
      { path: '/admin/users', element: <div>Users (coming in Task 8)</div> },
      { path: '/admin/workshops', element: <div>Workshops (coming in Task 10)</div> },
      { path: '/admin/shifts', element: <div>Shifts (coming in Task 10)</div> },
      { path: '/admin/audit', element: <div>Audit (coming in Task 14)</div> },
      { path: '/admin/trash', element: <div>Trash (coming in Task 15)</div> },
    ],
  },
]);
```

- [ ] **Step 11: Verify layout**

Start dev server. Login. Verify:
1. Three-column layout: sidebar (220px) | main | right panel (280px on xl+)
2. Sidebar collapses on mobile, hamburger shows
3. Dark mode toggle works
4. Glassmorphism on cards
5. Nav items have stagger animation on load
6. Sidebar active state has gradient highlight

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: add three-column layout with glassmorphism sidebar, dark mode, and shared components"
```

---

### Task 7: Users & Roles Backend

**Files:**
- Create: `apps/api/src/modules/users/users.module.ts`
- Create: `apps/api/src/modules/users/users.controller.ts`
- Create: `apps/api/src/modules/users/users.service.ts`
- Create: `apps/api/src/modules/users/dto/create-user.dto.ts`
- Create: `apps/api/src/modules/users/dto/update-user.dto.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Create: `apps/api/src/common/guards/permissions.guard.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/decorators/permissions.decorator.ts`

**Interfaces:**
- Consumes: `PrismaService`, `JwtAuthGuard`, `@evidence/shared` (createUserSchema, PERMISSIONS, ROLE_SLUGS)
- Produces: `UsersModule` with endpoints: `GET /api/v1/users` (list with pagination), `GET /api/v1/users/:id`, `POST /api/v1/users` (admin/mistr only), `PATCH /api/v1/users/:id`, `DELETE /api/v1/users/:id` (soft delete), `GET /api/v1/users/:id/permissions`, `POST /api/v1/users/:id/permissions`, `DELETE /api/v1/users/:id/permissions/:permId`. `RolesGuard` checking `@Roles()` decorator. `PermissionsGuard` checking `@RequirePermissions()` decorator.

- [ ] **Step 1: Create Roles and Permissions decorators and guards**

```typescript
// apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// apps/api/src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

```typescript
// apps/api/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;
    const { user } = context.switchToHttp().getRequest();
    return required.includes(user?.role?.slug);
  }
}
```

```typescript
// apps/api/src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DEFAULT_ROLE_PERMISSIONS } from '@evidence/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) return false;

    const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role.slug] || [];
    const userPerms = (user.permissions || []).map((p: any) => p.permission);
    const allPerms = [...rolePerms, ...userPerms];

    return required.every((perm) => allPerms.includes(perm));
  }
}
```

- [ ] **Step 2: Create UsersService**

```typescript
// apps/api/src/modules/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { CreateUserInput, UpdateUserInput } from '@evidence/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { cursor?: string; limit?: number }) {
    const limit = params.limit || 20;
    const where = { deletedAt: null };
    const users = await this.prisma.user.findMany({
      where,
      take: limit + 1,
      ...(params.cursor && { cursor: { id: params.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: { role: true, workshop: true },
    });
    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, limit) : users;
    return {
      data: data.map(({ passwordHash, ...u }) => u),
      meta: { hasMore, cursor: data.at(-1)?.id },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, workshop: true, permissions: true },
    });
    if (!user) throw new NotFoundException('Uživatel nenalezen');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async create(data: CreateUserInput) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        roleId: data.roleId,
        workshopId: data.workshopId,
        phone: data.phone,
        position: data.position,
      },
      include: { role: true },
    });
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.workshopId !== undefined && { workshopId: data.workshopId }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.position !== undefined && { position: data.position }),
      },
      include: { role: true, workshop: true },
    });
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Uživatel smazán' };
  }

  async getPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async grantPermission(userId: string, permission: string, grantedBy: string) {
    return this.prisma.userPermission.create({
      data: { userId, permission: permission as any, grantedBy },
    });
  }

  async revokePermission(permissionId: string) {
    return this.prisma.userPermission.delete({ where: { id: permissionId } });
  }

  async getRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }
}
```

- [ ] **Step 3: Create UsersController**

```typescript
// apps/api/src/modules/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createUserSchema, updateUserSchema, PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll({ cursor, limit: limit ? parseInt(limit) : undefined });
  }

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  create(@Body(new ZodValidationPipe(createUserSchema)) body: any) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateUserSchema)) body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  delete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Get(':id/permissions')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  getPermissions(@Param('id') id: string) {
    return this.usersService.getPermissions(id);
  }

  @Post(':id/permissions')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  grantPermission(
    @Param('id') id: string,
    @Body('permission') permission: string,
    @CurrentUser('id') grantedBy: string,
  ) {
    return this.usersService.grantPermission(id, permission, grantedBy);
  }

  @Delete(':id/permissions/:permId')
  @RequirePermissions(PERMISSIONS.USERS_GRANT_PERMISSIONS)
  revokePermission(@Param('permId') permId: string) {
    return this.usersService.revokePermission(permId);
  }
}
```

- [ ] **Step 4: Create UsersModule and register in AppModule**

```typescript
// apps/api/src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

Add `UsersModule` to `AppModule` imports.

- [ ] **Step 5: Test users API**

```bash
# Login first, get TOKEN
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evidence.local","password":"admin"}' -c cookies.txt

# List users
curl http://localhost:3001/api/v1/users -H "Authorization: Bearer <TOKEN>"

# Create user
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@evidence.local","password":"testpass1","fullName":"Test User","roleId":"<SERIZOVAC_ROLE_ID>"}'
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add users CRUD with roles guard, permissions guard, and permission management"
```

---

### Task 8: Users & Roles Frontend

**Files:**
- Create: `apps/web/src/api/users.ts`
- Create: `apps/web/src/pages/admin/UsersPage.tsx`
- Create: `apps/web/src/pages/admin/components/UserTable.tsx`
- Create: `apps/web/src/pages/admin/components/UserFormDialog.tsx`
- Modify: `apps/web/src/app/router.tsx` (replace placeholder)

**Interfaces:**
- Consumes: Users API (Task 7), `<GlassCard>`, `<GradientButton>`, `<PageHeader>`, `<ConfirmDialog>`, `usePermissions()`
- Produces: `/admin/users` page with user list (glass-card table), create/edit dialog, delete with confirm, role filter

- [ ] **Step 1: Create users API client**

```typescript
// apps/web/src/api/users.ts
import { api } from './client';
import type { User, Role, CreateUserInput, UpdateUserInput, ApiResponse } from '@evidence/shared';

export const usersApi = {
  list: (params?: { cursor?: string; limit?: number }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),

  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserInput) => api.post<ApiResponse<User>>('/users', data),

  update: (id: string, data: UpdateUserInput) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  getRoles: () => api.get<ApiResponse<Role[]>>('/users/roles'),
};
```

- [ ] **Step 2: Create UsersPage with UserTable**

```tsx
// apps/web/src/pages/admin/UsersPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UserFormDialog } from './components/UserFormDialog';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
    },
  });

  const users = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Uživatelé"
        subtitle={`${users.length} uživatelů`}
        actions={
          <GradientButton onClick={() => { setEditUser(null); setShowForm(true); }}>
            + Nový uživatel
          </GradientButton>
        }
      />

      {users.length === 0 && !isLoading ? (
        <EmptyState icon="👤" title="Žádní uživatelé" description="Vytvořte prvního uživatele" />
      ) : (
        <GlassCard hover={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Jméno</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">E-mail</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Dílna</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Akce</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="border-b border-slate-100/50 dark:border-slate-700/30 animate-fade-in hover:bg-white/30 dark:hover:bg-slate-700/20 transition-all duration-300"
                >
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{user.fullName}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={user.role?.slug || ''} label={user.role?.name || ''} /></td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.workshop?.name || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <GradientButton variant="ghost" size="sm" onClick={() => { setEditUser(user); setShowForm(true); }}>Upravit</GradientButton>
                      <GradientButton variant="ghost" size="sm" onClick={() => setDeleteUser(user)}>Smazat</GradientButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <UserFormDialog
        open={showForm}
        user={editUser}
        onClose={() => setShowForm(false)}
      />

      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
        title="Smazat uživatele?"
      >
        Uživatel <strong>{deleteUser?.fullName}</strong> bude přesunut do koše.
      </ConfirmDialog>
    </div>
  );
}
```

- [ ] **Step 3: Create UserFormDialog**

Create `apps/web/src/pages/admin/components/UserFormDialog.tsx` with a modal form using React Hook Form + Zod, fields: fullName, email, password (only for create), role select, workshop select, phone, position. On submit calls `usersApi.create()` or `usersApi.update()`, invalidates `['users']` query, closes dialog.

- [ ] **Step 4: Update router, verify users page**

Replace `/admin/users` placeholder in `router.tsx` with `<UsersPage />`. Verify: login as admin, navigate to users page, see user table, create new user, edit user, delete user (soft delete).

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add users management page with CRUD, role filter, and glassmorphism table"
```

---

### Task 9: Organization Backend (Workshops, Lines, Machines, Teams, Shifts)

**Files:**
- Create: `apps/api/src/modules/workshops/` (module, controller, service)
- Create: `apps/api/src/modules/production-lines/` (module, controller, service)
- Create: `apps/api/src/modules/machines/` (module, controller, service)
- Create: `apps/api/src/modules/teams/` (module, controller, service)
- Create: `apps/api/src/modules/shifts/` (module, controller, service)

**Interfaces:**
- Consumes: `PrismaService`, `JwtAuthGuard`, `PermissionsGuard`, `@evidence/shared` schemas
- Produces: Full CRUD endpoints for: `GET/POST/PATCH/DELETE /api/v1/workshops`, `/api/v1/production-lines`, `/api/v1/machines` (+ `GET /:id/history`), `/api/v1/teams` (+ member management), `/api/v1/shifts`

- [ ] **Step 1: Create each module following the UsersModule pattern**

Each module follows the same structure as Task 7: module.ts, controller.ts, service.ts. The service uses PrismaService for CRUD with soft delete (`deletedAt: null` filter). The controller uses `@UseGuards(JwtAuthGuard, PermissionsGuard)` and `@RequirePermissions(...)`.

Key differences per module:
- **WorkshopsService**: CRUD + `getMembers(workshopId)` listing all users in workshop
- **ProductionLinesService**: CRUD, filtered by `workshopId`
- **MachinesService**: CRUD + `addResponsible(machineId, userId, role)` + `getHistory(machineId)` returning work records for that machine
- **TeamsService**: CRUD + `addMember(teamId, userId)` + `removeMember(teamId, userId)`
- **ShiftsService**: CRUD, admin-only (`SETTINGS_MANAGE` permission)

- [ ] **Step 2: Register all modules in AppModule**

Add `WorkshopsModule`, `ProductionLinesModule`, `MachinesModule`, `TeamsModule`, `ShiftsModule` to AppModule imports.

- [ ] **Step 3: Test all endpoints with curl**

```bash
# Create workshop
curl -X POST http://localhost:3001/api/v1/workshops \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hlavní dílna","code":"HD1"}'

# Create production line
curl -X POST http://localhost:3001/api/v1/production-lines \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Linka 1","workshopId":"<WORKSHOP_ID>"}'

# Create machine
curl -X POST http://localhost:3001/api/v1/machines \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"CNC Frézka","code":"CNC-001","lineId":"<LINE_ID>"}'
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add CRUD for workshops, production lines, machines, teams, and shifts"
```

---

### Task 10: Organization Frontend

**Files:**
- Create: `apps/web/src/api/workshops.ts`, `apps/web/src/api/machines.ts`, `apps/web/src/api/production-lines.ts`, `apps/web/src/api/shifts.ts`
- Create: `apps/web/src/pages/admin/WorkshopsPage.tsx`
- Create: `apps/web/src/pages/admin/ShiftsPage.tsx`
- Create: `apps/web/src/pages/machines/MachinesPage.tsx`
- Create: `apps/web/src/pages/machines/MachineDetailPage.tsx`
- Modify: `apps/web/src/app/router.tsx` (replace placeholders)

**Interfaces:**
- Consumes: Organization API endpoints (Task 9), shared UI components (Task 6)
- Produces: `/admin/workshops` page (workshops + production lines management), `/admin/shifts` page, `/machines` page (machine catalog with cards), `/machines/:id` page (machine detail with history)

- [ ] **Step 1: Create API clients for each entity**

Follow the pattern from `apps/web/src/api/users.ts` for workshops, production-lines, machines, shifts.

- [ ] **Step 2: Create WorkshopsPage**

Tabbed layout: Dílny tab (workshop list with nested production lines) + Týmy tab (team list with members). Each workshop row expandable to show production lines. Create/edit/delete actions.

- [ ] **Step 3: Create MachinesPage**

Grid of machine cards (`<GlassCard>`) showing: name, code, status badge, production line, photo thumbnail. Filter by workshop/line/status. Click opens MachineDetailPage.

- [ ] **Step 4: Create MachineDetailPage**

Machine info card + history table (work records for this machine) + responsibles list. Edit machine button for admin/mistr.

- [ ] **Step 5: Create ShiftsPage**

Simple table of shifts (name, start time, end time, active toggle). Admin only.

- [ ] **Step 6: Update router, verify all pages**

Replace placeholders. Verify navigation, CRUD operations, responsive layout.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add organization management pages (workshops, machines, shifts)"
```

---

### Task 11: Work Records Backend

**Files:**
- Create: `apps/api/src/modules/work-records/work-records.module.ts`
- Create: `apps/api/src/modules/work-records/work-records.controller.ts`
- Create: `apps/api/src/modules/work-records/work-records.service.ts`
- Create: `apps/api/src/modules/comments/comments.module.ts`
- Create: `apps/api/src/modules/comments/comments.controller.ts`
- Create: `apps/api/src/modules/comments/comments.service.ts`

**Interfaces:**
- Consumes: `PrismaService`, `JwtAuthGuard`, `PermissionsGuard`, `@evidence/shared` (createWorkRecordSchema)
- Produces: `WorkRecordsModule` with endpoints: `GET /api/v1/work-records` (list with filters: date, machine, category, author, status; cursor pagination), `GET /api/v1/work-records/:id`, `POST /api/v1/work-records`, `PATCH /api/v1/work-records/:id` (with Seřizovač same-day rule), `DELETE /api/v1/work-records/:id` (mistr/admin only), `POST /api/v1/work-records/:id/duplicate`, `GET/POST /api/v1/work-records/templates`. `CommentsModule` with polymorphic `GET/POST/PATCH/DELETE /api/v1/comments`.

- [ ] **Step 1: Create WorkRecordsService with business rules**

Key business rule implementation:
```typescript
// In update method — Seřizovač same-day rule
async update(id: string, data: any, currentUser: any) {
  const record = await this.findOne(id);

  if (currentUser.role.slug === 'serizovac') {
    if (record.authorId !== currentUser.id) {
      throw new ForbiddenException('Můžete upravovat pouze vlastní záznamy');
    }
    const recordDate = new Date(record.createdAt).toDateString();
    const today = new Date().toDateString();
    if (recordDate !== today) {
      throw new ForbiddenException('Záznamy lze upravovat pouze v den vytvoření');
    }
  }
  // ... prisma update
}
```

- [ ] **Step 2: Create WorkRecordsController with all endpoints**

Include filter parsing:
```typescript
@Get()
@UseGuards(JwtAuthGuard)
findAll(
  @Query('cursor') cursor?: string,
  @Query('limit') limit?: string,
  @Query('category') category?: string,
  @Query('machine_id') machineId?: string,
  @Query('date_from') dateFrom?: string,
  @Query('date_to') dateTo?: string,
  @Query('status') status?: string,
  @Query('author_id') authorId?: string,
  @CurrentUser() user?: any,
) {
  return this.workRecordsService.findAll({
    cursor, limit: limit ? parseInt(limit) : undefined,
    category, machineId, dateFrom, dateTo, status, authorId,
    currentUser: user,
  });
}
```

- [ ] **Step 3: Create CommentsModule (polymorphic)**

CommentsService with `entityType` + `entityId` pattern. Endpoints filter by `entity_type` and `entity_id` query params.

- [ ] **Step 4: Register modules, test endpoints**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add work records CRUD with business rules and polymorphic comments"
```

---

### Task 12: Work Records Frontend

**Files:**
- Create: `apps/web/src/api/work-records.ts`
- Create: `apps/web/src/pages/evidence/EvidencePage.tsx`
- Create: `apps/web/src/pages/evidence/components/EvidenceFilters.tsx`
- Create: `apps/web/src/pages/evidence/components/EvidenceTable.tsx`
- Create: `apps/web/src/pages/evidence/components/EvidenceCard.tsx`
- Create: `apps/web/src/pages/evidence/forms/WorkRecordForm.tsx`
- Create: `apps/web/src/pages/evidence/forms/sections/BasicInfoSection.tsx`
- Create: `apps/web/src/pages/evidence/forms/sections/DescriptionSection.tsx`
- Create: `apps/web/src/pages/evidence/forms/sections/DowntimeSection.tsx`
- Modify: `apps/web/src/app/router.tsx`

**Interfaces:**
- Consumes: Work Records API (Task 11), Machines API (Task 9), Shifts API (Task 9), shared UI components
- Produces: `/evidence` page with filtered table of work records, create/edit form as full-page view with sections (BasicInfo, Description, Downtime/Maintenance), filters (date range, category, machine, status), mobile-responsive card view

- [ ] **Step 1: Create work-records API client**

```typescript
// apps/web/src/api/work-records.ts
import { api } from './client';
import type { WorkRecord, CreateWorkRecordInput, UpdateWorkRecordInput, ApiResponse } from '@evidence/shared';

export const workRecordsApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ data: WorkRecord[]; meta: { hasMore: boolean; cursor?: string } }>('/work-records', { params }),

  get: (id: string) => api.get<ApiResponse<WorkRecord>>(`/work-records/${id}`),

  create: (data: CreateWorkRecordInput) => api.post<ApiResponse<WorkRecord>>('/work-records', data),

  update: (id: string, data: UpdateWorkRecordInput) =>
    api.patch<ApiResponse<WorkRecord>>(`/work-records/${id}`, data),

  delete: (id: string) => api.delete(`/work-records/${id}`),

  duplicate: (id: string) => api.post<ApiResponse<WorkRecord>>(`/work-records/${id}/duplicate`),
};
```

- [ ] **Step 2: Create EvidencePage with table and filters**

Page structure: `<PageHeader>` with "Nový záznam" button → `<EvidenceFilters>` (date range, category dropdown, machine dropdown, status dropdown) → `<EvidenceTable>` on desktop / `<EvidenceCard>` list on mobile. Each row shows: date, machine, category badge, description (truncated), priority badge, status badge, author, actions.

- [ ] **Step 3: Create WorkRecordForm**

Full-page form (navigate to `/evidence/new` or `/evidence/:id/edit`) with sections:
- **BasicInfoSection**: machine select, line select (auto-filtered by workshop), shift select, category select, date, start time, end time
- **DescriptionSection**: description textarea, priority select, status select
- **DowntimeSection** (visible when category is failure/maintenance): downtime minutes, cause, maintenance done, replaced parts, required parts, recommendations

Each section is a `<GlassCard>` with flex-col gap-4 layout. Form uses React Hook Form + Zod validation from `@evidence/shared`.

- [ ] **Step 4: Add routes for evidence pages**

```tsx
{ path: '/evidence', element: <EvidencePage /> },
{ path: '/evidence/new', element: <WorkRecordForm /> },
{ path: '/evidence/:id/edit', element: <WorkRecordForm /> },
```

- [ ] **Step 5: Verify evidence page**

Login, navigate to evidence, create a work record, verify it appears in the table, edit it, verify same-day rule for serizovac, verify filters work.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add evidence page with work record CRUD, filters, and sectioned form"
```

---

### Task 13: Dashboard

**Files:**
- Create: `apps/api/src/modules/statistics/statistics.module.ts`
- Create: `apps/api/src/modules/statistics/statistics.controller.ts`
- Create: `apps/api/src/modules/statistics/statistics.service.ts`
- Create: `apps/web/src/pages/dashboard/DashboardPage.tsx`
- Create: `apps/web/src/pages/dashboard/components/StatsCard.tsx`
- Create: `apps/web/src/pages/dashboard/components/RecentRecords.tsx`
- Create: `apps/web/src/pages/dashboard/components/QuickActions.tsx`
- Modify: `apps/web/src/app/router.tsx`

**Interfaces:**
- Consumes: `PrismaService`, Work Records data, Machines data
- Produces: `GET /api/v1/statistics/dashboard` returning `{ todayRecords, totalDowntime, machinesInBreakdown, openRecords, recentRecords }`. Dashboard page with animated stat cards, recent records list, and quick action buttons.

- [ ] **Step 1: Create StatisticsService**

```typescript
// apps/api/src/modules/statistics/statistics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string, userRole: string, workshopId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayRecords, totalDowntime, machinesBreakdown, openRecords, recentRecords] =
      await Promise.all([
        this.prisma.workRecord.count({
          where: { date: { gte: today }, deletedAt: null },
        }),
        this.prisma.workRecord.aggregate({
          where: { date: { gte: today }, deletedAt: null },
          _sum: { downtimeMin: true },
        }),
        this.prisma.machine.count({
          where: { status: 'breakdown', deletedAt: null },
        }),
        this.prisma.workRecord.count({
          where: { status: { in: ['open', 'in_progress'] }, deletedAt: null },
        }),
        this.prisma.workRecord.findMany({
          where: { deletedAt: null },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { fullName: true } }, machine: { select: { name: true, code: true } } },
        }),
      ]);

    return {
      todayRecords,
      totalDowntimeMin: totalDowntime._sum.downtimeMin || 0,
      machinesInBreakdown: machinesBreakdown,
      openRecords,
      recentRecords,
    };
  }
}
```

- [ ] **Step 2: Create controller and module, register in AppModule**

- [ ] **Step 3: Create DashboardPage with animated stat cards**

```tsx
// apps/web/src/pages/dashboard/components/StatsCard.tsx
import { GlassCard } from '@/components/shared/GlassCard';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  gradient: string;
  delay: number;
}

export function StatsCard({ icon, label, value, gradient, delay }: StatsCardProps) {
  return (
    <GlassCard
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center text-xl shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            {value}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}
```

Dashboard layout: 4 stat cards in responsive grid → recent records list → quick actions row.

- [ ] **Step 4: Verify dashboard**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add dashboard with animated stat cards, recent records, and quick actions"
```

---

### Task 14: Audit Log

**Files:**
- Create: `apps/api/src/common/interceptors/audit.interceptor.ts`
- Create: `apps/api/src/modules/audit-log/audit-log.module.ts`
- Create: `apps/api/src/modules/audit-log/audit-log.controller.ts`
- Create: `apps/api/src/modules/audit-log/audit-log.service.ts`
- Create: `apps/web/src/api/audit-log.ts`
- Create: `apps/web/src/pages/admin/AuditLogPage.tsx`
- Modify: `apps/api/src/app.module.ts` (register interceptor)
- Modify: `apps/web/src/app/router.tsx`

**Interfaces:**
- Consumes: `PrismaService`, `JwtAuthGuard`, `PermissionsGuard`
- Produces: `AuditInterceptor` that automatically logs every POST/PATCH/DELETE request to `audit_logs` table (user, action, entity type from URL, entity id, old/new values). `GET /api/v1/audit-logs` endpoint with filters (entity_type, user_id, action, date range). AuditLogPage showing log entries in a table.

- [ ] **Step 1: Create AuditInterceptor**

```typescript
// apps/api/src/common/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'DELETE'].includes(method)) return next.handle();

    const user = request.user;
    if (!user) return next.handle();

    const url = request.url;
    const urlParts = url.replace('/api/v1/', '').split('/');
    const entityType = urlParts[0];
    const entityId = urlParts[1] || null;

    const actionMap: Record<string, string> = { POST: 'create', PATCH: 'update', DELETE: 'delete' };
    const action = actionMap[method];

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: action as any,
              entityType,
              entityId: entityId || responseData?.data?.id || 'unknown',
              newValue: method !== 'DELETE' ? request.body : undefined,
              metadata: { ip: request.ip, url },
            },
          });
        } catch {}
      }),
    );
  }
}
```

- [ ] **Step 2: Register AuditInterceptor globally in AppModule**

```typescript
{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
```

- [ ] **Step 3: Create AuditLogService and Controller**

Service: `findAll()` with filters (entityType, userId, action, dateFrom, dateTo), cursor pagination, includes user relation.
Controller: `GET /api/v1/audit-logs` with `@RequirePermissions(PERMISSIONS.AUDIT_VIEW)`.

- [ ] **Step 4: Create AuditLogPage**

Table showing: timestamp, user name, action badge (create=green, update=amber, delete=rose), entity type, entity id. Filters at top. Read-only, no edit/delete actions.

- [ ] **Step 5: Verify — create a work record, check audit log shows the action**

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add automatic audit logging interceptor and audit log viewer"
```

---

### Task 15: Trash Module

**Files:**
- Create: `apps/api/src/modules/trash/trash.module.ts`
- Create: `apps/api/src/modules/trash/trash.controller.ts`
- Create: `apps/api/src/modules/trash/trash.service.ts`
- Create: `apps/web/src/api/trash.ts`
- Create: `apps/web/src/pages/admin/TrashPage.tsx`
- Modify: `apps/web/src/app/router.tsx`

**Interfaces:**
- Consumes: `PrismaService`, `JwtAuthGuard`, `PermissionsGuard`
- Produces: `GET /api/v1/trash` (lists all soft-deleted entities grouped by type), `POST /api/v1/trash/:entityType/:id/restore` (sets `deletedAt` back to null), `DELETE /api/v1/trash/:entityType/:id/permanent` (admin only, hard delete). TrashPage showing deleted items with restore/permanent-delete buttons.

- [ ] **Step 1: Create TrashService**

```typescript
// apps/api/src/modules/trash/trash.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const TRASHABLE_ENTITIES = ['user', 'workshop', 'productionLine', 'machine', 'team', 'workRecord', 'comment'] as const;

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const results = await Promise.all(
      TRASHABLE_ENTITIES.map(async (entity) => {
        const items = await (this.prisma[entity] as any).findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: 'desc' },
          take: 50,
        });
        return { entityType: entity, items };
      }),
    );
    return results.filter((r) => r.items.length > 0);
  }

  async restore(entityType: string, id: string) {
    const model = this.prisma[entityType as keyof typeof this.prisma] as any;
    if (!model) throw new NotFoundException('Neplatný typ entity');
    await model.update({ where: { id }, data: { deletedAt: null } });
    return { message: 'Obnoveno' };
  }

  async permanentDelete(entityType: string, id: string) {
    const model = this.prisma[entityType as keyof typeof this.prisma] as any;
    if (!model) throw new NotFoundException('Neplatný typ entity');
    await model.delete({ where: { id } });
    return { message: 'Trvale smazáno' };
  }
}
```

- [ ] **Step 2: Create controller and module**

Controller: `GET /api/v1/trash` (trash.restore permission), `POST /api/v1/trash/:entityType/:id/restore`, `DELETE /api/v1/trash/:entityType/:id/permanent` (admin only).

- [ ] **Step 3: Create TrashPage**

Grouped list of deleted items. Each group has entity type header. Each item shows: name/description, deleted date, "Obnovit" button, "Trvale smazat" button (admin only). Both actions use `<ConfirmDialog>`.

- [ ] **Step 4: Verify — delete a user, check trash, restore them**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add trash module with restore and permanent delete"
```

---

## Phase 1 Complete

After all 15 tasks, the MVP includes:
- Monorepo with shared types
- JWT auth (login, refresh, logout)
- User management with roles and granular permissions
- Organization structure (workshops, production lines, machines, teams)
- Work records (evidence práce) with business rules
- Dashboard with live stats
- Automatic audit logging
- Trash with restore capability
- Calming glassmorphism UI with gradients and animations
- Dark/light mode
- Responsive layout (mobile → desktop)
- Seed script (admin + mistr accounts)

**Next:** Create separate plans for Phase 2 (Chat, Notifications, Tasks, Calendar), Phase 3 (Statistics, Reports), and Phase 4 (E2E tests, Production deployment).
