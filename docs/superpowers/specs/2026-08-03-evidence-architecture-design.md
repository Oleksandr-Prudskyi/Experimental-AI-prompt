# Evidence — Architecture Design Specification

Universal internal production management web application for manufacturing factories.
Designed as a reusable template — adaptable to any factory, any industry.
Language: Czech (CZ). Internal use only. On-premise deployment.

---

## 1. Product Vision

A central workplace where factory employees record completed work, downtime, maintenance activities, and communicate. The system replaces paperwork, improves traceability, and provides production insights. Designed as a universal template deployable to any manufacturing facility.

Key principles:
- Every action is traceable (audit log)
- Only authenticated users access the system
- UI optimized for factory workers on any device
- Calming, premium visual design — gradients, smooth animations, glassmorphism
- Dark/light mode with seamless transitions
- Factory-agnostic: configurable company name, logo, branding via settings

---

## 2. User Roles & Permissions

### Role Hierarchy

```
Administrator (full system access)
    └── Mistr (production sub-admin)
        └── Seřizovač (operator)

Vedoucí výroby (read-only analyst, separate branch)
```

### Permission Matrix

| Action | Seřizovač | Mistr | Vedoucí výroby | Admin |
|---|---|---|---|---|
| **Evidence práce** | | | | |
| Create record | Own | All | — | All |
| Edit record | Own, same day only | All, anytime | — | All |
| Delete record | — | All | — | All |
| View records | Own + own workshop | All | All | All |
| Comment | Own | All | All | All |
| **Machines** | | | | |
| View catalog | Yes | Yes | Yes | Yes |
| Add/edit machine | — | Yes (photo, desc, responsibles) | — | Yes |
| Delete machine | — | Yes | — | Yes |
| View machine history | Yes | Yes | Yes | Yes |
| **Organization** | | | | |
| Create/delete workshop | — | Yes | — | Yes |
| Create/delete team/group | — | Yes | — | Yes |
| Assign responsibles | — | Yes | — | Yes |
| **People management** | | | | |
| Grant/change permissions | — | Yes (except Admin) | — | Yes |
| Assign position | — | Yes | — | Yes |
| Assign task | — | Yes | — | Yes |
| **Tasks** | | | | |
| Personal task list | Yes | Yes | — | Yes |
| Assign tasks to others | — | Yes | — | Yes |
| **Chat (Phase 2)** | | | | |
| Private messages | Yes | Yes | Yes | Yes |
| Create channel/group | — | Yes | — | Yes |
| **Announcements** | | | | |
| Create announcement | — | Yes | — | Yes |
| **Statistics** | | | | |
| View statistics | Own workshop | All | All + KPI + export | All |
| Generate reports | — | — | Yes (PDF/Excel/CSV) | Yes |
| **Audit log** | | | | |
| View | — | Own workshop | — | All |
| **System** | | | | |
| System settings | — | — | — | Yes |
| Backups | — | — | — | Yes |
| Shift management | — | — | — | Yes |

### Granular Per-User Permissions

Roles provide baseline permissions. Admin and Mistr can grant individual permissions to any user beyond their role defaults. Stored in `user_permissions` table with `granted_by` reference.

### Key Rules
- Mistr cannot: change other Mistrs, change Admins, delete audit log, change system settings
- Seřizovač: edit only own records, only on creation day (after 00:00 = read-only)
- Vedoucí výroby: pure analytics role — view, analyze, export, but no create/edit on production records

---

## 3. Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 6 | Build tool, HMR |
| TypeScript 5.5+ | Type safety |
| React Router 7 | SPA routing |
| TanStack Query v5 | Server state, caching, optimistic updates |
| Zustand | Client state (UI state, sidebar, modals) |
| Tailwind CSS 4 | Utility-first styles + design tokens |
| shadcn/ui | Component library (Radix-based, accessible) |
| Recharts | Charts and diagrams for statistics |
| React Hook Form + Zod | Forms and validation |
| date-fns | Date handling (CZ locale) |
| Socket.io-client | Real-time notifications and chat |

### Backend
| Technology | Purpose |
|---|---|
| NestJS 11 | Backend framework (modules, DI, guards, pipes) |
| Prisma 6 | ORM, migrations, type-safe DB |
| PostgreSQL 16 | Primary database |
| Redis 7 | Cache, sessions, pub/sub for WebSocket |
| Socket.io | Real-time (chat, notifications, live updates) |
| Bull + BullMQ | Job queue (reports, notifications) |
| Passport.js | Authentication (JWT + Local strategy) |
| MinIO | S3-compatible file storage (on-premise) |
| Sharp | Image processing (thumbnails, compression) |
| Multer | File upload middleware |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization and orchestration |
| Nginx | Reverse proxy, SSL, static files |
| pnpm workspaces | Monorepo (shared types FE/BE) |
| Turborepo | Build orchestration, caching |
| Vitest | Unit tests |
| Playwright | E2E tests |
| ESLint + Prettier | Code quality |

### Stack Justification
- **NestJS** over Express: modular architecture, DI, guards for auth, pipes for validation — enterprise patterns out of the box
- **Prisma** over TypeORM: better DX, auto-generated types, clearer migration schema
- **TanStack Query** over Redux: server state doesn't need a global store, optimistic updates and caching built-in
- **Zustand** over Context: simpler API for UI state, fewer re-renders
- **shadcn/ui** over MUI/Ant: full control, accessibility (Radix), tailwind-native, no bundle weight
- **MinIO** over filesystem: S3 API for future cloud migration, file versioning
- **pnpm workspaces**: shared `@evidence/shared` package for types between FE and BE

---

## 4. Project Structure (Monorepo)

```
evidence/
├── packages/
│   └── shared/                    # @evidence/shared
│       ├── src/
│       │   ├── types/             # Shared TypeScript types
│       │   │   ├── user.ts
│       │   │   ├── machine.ts
│       │   │   ├── work-record.ts
│       │   │   ├── chat.ts
│       │   │   └── api.ts
│       │   ├── constants/
│       │   │   ├── roles.ts
│       │   │   ├── permissions.ts
│       │   │   └── categories.ts
│       │   └── validation/        # Zod schemas (shared FE/BE)
│       │       ├── work-record.schema.ts
│       │       └── user.schema.ts
│       └── package.json
│
├── apps/
│   ├── web/                       # React Frontend (Vite)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── evidence/
│   │   │   │   ├── machines/
│   │   │   │   ├── calendar/
│   │   │   │   ├── tasks/
│   │   │   │   ├── chat/
│   │   │   │   ├── statistics/
│   │   │   │   ├── admin/
│   │   │   │   └── settings/
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn/ui
│   │   │   │   ├── layout/        # Sidebar, Header, RightPanel
│   │   │   │   ├── forms/
│   │   │   │   └── shared/        # DataTable, Filters, Search
│   │   │   ├── hooks/
│   │   │   ├── api/               # TanStack Query hooks
│   │   │   ├── stores/            # Zustand
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── api/                       # NestJS Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── work-records/
│       │   │   ├── machines/
│       │   │   ├── production-lines/
│       │   │   ├── workshops/
│       │   │   ├── teams/
│       │   │   ├── tasks/
│       │   │   ├── calendar/
│       │   │   ├── chat/
│       │   │   ├── announcements/
│       │   │   ├── notifications/
│       │   │   ├── attachments/
│       │   │   ├── statistics/
│       │   │   ├── reports/
│       │   │   ├── audit-log/
│       │   │   ├── shifts/
│       │   │   ├── trash/
│       │   │   └── settings/
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── filters/
│       │   ├── config/
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   ├── migrations/
│       │   │   └── seed.ts
│       │   └── main.ts
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── nginx/nginx.conf
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docs/
├── pnpm-workspace.yaml
├── package.json
├── .env.example
└── turbo.json
```

Each page directory follows the pattern:
```
pages/evidence/
├── EvidencePage.tsx
├── components/
│   ├── EvidenceHeader.tsx
│   ├── EvidenceFilters.tsx
│   ├── EvidenceTable.tsx
│   ├── EvidenceCard.tsx
│   ├── EvidenceEmptyState.tsx
│   └── EvidenceQuickAdd.tsx
├── forms/
│   ├── WorkRecordForm.tsx
│   └── sections/
│       ├── BasicInfoSection.tsx
│       ├── DescriptionSection.tsx
│       ├── DowntimeSection.tsx
│       ├── MaintenanceSection.tsx
│       └── AttachmentsSection.tsx
├── hooks/
│   ├── useWorkRecords.ts
│   └── useWorkRecordForm.ts
└── types.ts
```

---

## 5. Database Schema (PostgreSQL + Prisma)

### Enums

```
WorkRecordCategory: failure | maintenance | adjustment | cleaning |
                    inspection | machine_setup | other

Priority:           low | medium | high | critical

WorkRecordStatus:   draft | open | in_progress | resolved | closed

MachineStatus:      operational | maintenance | breakdown | decommissioned

Permission:         records.create | records.edit_all | records.delete |
                    machines.manage | workshops.manage | teams.manage |
                    users.manage | users.grant_permissions |
                    announcements.manage | chat.create_channel |
                    statistics.view_all | reports.generate |
                    audit.view | settings.manage | trash.restore

NotificationType:   new_message | new_announcement | new_comment |
                    task_assigned | mention | system_alert

AuditAction:        create | update | delete | restore | login | logout

ChatChannelType:    dm | group | channel

TaskStatus:         open | in_progress | done | archived

AnnouncementPriority: info | important | critical
```

### Core Tables

**users** — id (uuid PK), email, password_hash, full_name, avatar_url?, role_id (FK→roles), workshop_id (FK→workshops)?, phone?, position?, is_active, deleted_at?, created_at, updated_at

**roles** — id (uuid PK), name, slug (enum), description?, is_system

**user_permissions** — id (uuid PK), user_id (FK→users), permission (enum), granted_by (FK→users), created_at

**workshops** — id (uuid PK), name, code, description?, deleted_at?, created_at, updated_at

**production_lines** — id (uuid PK), workshop_id (FK→workshops), name, code?, deleted_at?, created_at, updated_at

**machines** — id (uuid PK), line_id (FK→production_lines), name, code, description?, photo_url?, status (enum), commissioned_at?, deleted_at?, created_at, updated_at

**machine_responsibles** — machine_id (FK→machines), user_id (FK→users), role (varchar), created_at — composite PK

**teams** — id (uuid PK), name, workshop_id (FK→workshops), deleted_at?, created_at, updated_at

**team_members** — team_id (FK→teams), user_id (FK→users), created_at — composite PK

**work_records** — id (uuid PK), author_id (FK→users), machine_id (FK→machines), line_id (FK→production_lines), shift_id (FK→shifts)?, category (enum), date, start_time, end_time?, duration_min (computed), description, downtime_min?, cause?, maintenance_done?, replaced_parts?, required_parts?, recommendations?, priority (enum), status (enum), is_draft, deleted_at?, created_at, updated_at

**work_record_templates** — id (uuid PK), author_id (FK→users), name, category (enum), machine_id?, description?, default_values (jsonb), created_at

**shifts** — id (uuid PK), name, start_time (time), end_time (time), is_active, created_at, updated_at

**comments** — id (uuid PK), author_id (FK→users), entity_type (enum), entity_id (uuid), content, deleted_at?, created_at, updated_at

**attachments** — id (uuid PK), uploader_id (FK→users), entity_type (enum), entity_id (uuid), file_name, file_url, file_size, mime_type, thumbnail_url?, deleted_at?, created_at

**chat_channels** — id (uuid PK), name?, type (enum: dm/group/channel), workshop_id (FK→workshops)?, topic?, created_by (FK→users), deleted_at?, created_at, updated_at

**chat_channel_members** — channel_id (FK→chat_channels), user_id (FK→users), joined_at, last_read_at? — composite PK

**chat_messages** — id (uuid PK), channel_id (FK→chat_channels), sender_id (FK→users), content, reply_to_id (uuid, self-ref)?, deleted_at?, created_at

**chat_bookmarks** — id (uuid PK), user_id (FK→users), message_id (FK→chat_messages), label?, created_at

**announcements** — id (uuid PK), author_id (FK→users), title, content, priority (enum), is_active, expires_at?, deleted_at?, created_at, updated_at

**notifications** — id (uuid PK), user_id (FK→users), type (enum), title, body?, entity_type?, entity_id?, is_read, created_at

**tasks** — id (uuid PK), title, description?, assignee_id (FK→users), assigned_by (FK→users), priority (enum), status (enum), deadline?, deleted_at?, created_at, updated_at

**calendar_events** — id (uuid PK), author_id (FK→users), title, description?, type (enum: maintenance/inspection/other), machine_id (FK→machines)?, line_id (FK→production_lines)?, start_at, end_at?, all_day, deleted_at?, created_at, updated_at

**audit_logs** — id (uuid PK), user_id (FK→users), action (enum), entity_type, entity_id, old_value (jsonb)?, new_value (jsonb)?, metadata (jsonb)?, created_at — append-only, no update/delete

**settings** — id (uuid PK), key (unique), value (jsonb), updated_by (FK→users)?, updated_at

### Key Indexes
- `work_records`: composite on `(date, machine_id, author_id, category)`
- `audit_logs`: on `(entity_type, entity_id, created_at)`
- `chat_messages`: on `(channel_id, created_at)`
- `notifications`: on `(user_id, is_read, created_at)`
- All `deleted_at`: partial index `WHERE deleted_at IS NULL`
- `users.email`: unique index
- `machines.code`: unique index
- Full-text: `work_records.description` using `tsvector` with `cs_CZ` config (unaccent extension)

### Soft Delete
Every main table has `deleted_at timestamp?`. NULL = active, timestamp = deleted. Trash module shows all soft-deleted records with restore capability. Physical deletion after 30 days via cron job.

### Polymorphic Relations
`comments` and `attachments` use `entity_type` + `entity_id` pattern to attach to any entity (work_record, machine, task, calendar_event).

### Czech Language Support
- PostgreSQL UTF-8 encoding (default)
- `unaccent` extension for diacritics-insensitive search
- `cs_CZ` collation for proper Czech name sorting

---

## 6. API Architecture (NestJS REST)

### General Principles
- Format: REST JSON, versioned via URL prefix `/api/v1/`
- Auth: Bearer JWT in header, refresh token in httpOnly cookie
- Responses: unified wrapper `{ data, meta, error }`
- Pagination: cursor-based `?cursor=...&limit=20`
- Filters: query params `?category=failure&machine_id=...&date_from=...`
- Sorting: `?sort=created_at&order=desc`
- Errors: HTTP codes + `{ error: { code, message, details } }`
- Rate limiting: 100 req/min per user, 10 req/min for auth endpoints

### Endpoints

```
AUTH
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/logout
  GET    /api/v1/auth/me

USERS
  GET    /api/v1/users
  GET    /api/v1/users/:id
  POST   /api/v1/users
  PATCH  /api/v1/users/:id
  DELETE /api/v1/users/:id
  GET    /api/v1/users/:id/permissions
  POST   /api/v1/users/:id/permissions
  DELETE /api/v1/users/:id/permissions/:permId

WORK RECORDS
  GET    /api/v1/work-records
  GET    /api/v1/work-records/:id
  POST   /api/v1/work-records
  PATCH  /api/v1/work-records/:id
  DELETE /api/v1/work-records/:id
  POST   /api/v1/work-records/:id/duplicate
  GET    /api/v1/work-records/templates
  POST   /api/v1/work-records/templates

MACHINES
  GET    /api/v1/machines
  GET    /api/v1/machines/:id
  POST   /api/v1/machines
  PATCH  /api/v1/machines/:id
  DELETE /api/v1/machines/:id
  GET    /api/v1/machines/:id/history
  GET    /api/v1/machines/:id/statistics
  POST   /api/v1/machines/:id/responsibles

PRODUCTION LINES
  GET    /api/v1/production-lines
  POST   /api/v1/production-lines
  PATCH  /api/v1/production-lines/:id
  DELETE /api/v1/production-lines/:id

WORKSHOPS
  GET    /api/v1/workshops
  POST   /api/v1/workshops
  PATCH  /api/v1/workshops/:id
  DELETE /api/v1/workshops/:id
  GET    /api/v1/workshops/:id/members

TEAMS
  GET    /api/v1/teams
  POST   /api/v1/teams
  PATCH  /api/v1/teams/:id
  DELETE /api/v1/teams/:id
  POST   /api/v1/teams/:id/members
  DELETE /api/v1/teams/:id/members/:userId

TASKS
  GET    /api/v1/tasks
  GET    /api/v1/tasks/my
  POST   /api/v1/tasks
  PATCH  /api/v1/tasks/:id
  DELETE /api/v1/tasks/:id

CALENDAR
  GET    /api/v1/calendar/events
  POST   /api/v1/calendar/events
  PATCH  /api/v1/calendar/events/:id
  DELETE /api/v1/calendar/events/:id

CHAT (Phase 2)
  GET    /api/v1/chat/channels
  POST   /api/v1/chat/channels
  GET    /api/v1/chat/channels/:id/messages
  POST   /api/v1/chat/channels/:id/messages
  DELETE /api/v1/chat/messages/:id

ANNOUNCEMENTS
  GET    /api/v1/announcements
  POST   /api/v1/announcements
  PATCH  /api/v1/announcements/:id
  DELETE /api/v1/announcements/:id

NOTIFICATIONS
  GET    /api/v1/notifications
  PATCH  /api/v1/notifications/:id/read
  POST   /api/v1/notifications/read-all

COMMENTS (polymorphic)
  GET    /api/v1/comments?entity_type=...&entity_id=...
  POST   /api/v1/comments
  PATCH  /api/v1/comments/:id
  DELETE /api/v1/comments/:id

ATTACHMENTS
  POST   /api/v1/attachments/upload
  DELETE /api/v1/attachments/:id
  GET    /api/v1/attachments/:id/download

STATISTICS
  GET    /api/v1/statistics/dashboard
  GET    /api/v1/statistics/downtime
  GET    /api/v1/statistics/machines
  GET    /api/v1/statistics/employees
  GET    /api/v1/statistics/kpi

REPORTS
  POST   /api/v1/reports/generate
  GET    /api/v1/reports/:id/download

SHIFTS
  GET    /api/v1/shifts
  POST   /api/v1/shifts
  PATCH  /api/v1/shifts/:id
  DELETE /api/v1/shifts/:id

TRASH
  GET    /api/v1/trash
  POST   /api/v1/trash/:entityType/:id/restore
  DELETE /api/v1/trash/:entityType/:id/permanent

AUDIT LOG
  GET    /api/v1/audit-logs

SEARCH
  GET    /api/v1/search?q=...&type=...

SETTINGS (admin only)
  GET    /api/v1/settings
  PATCH  /api/v1/settings
```

### WebSocket Events (Socket.io)

```
CLIENT → SERVER:
  chat:send_message    { channelId, content, attachments }
  chat:typing          { channelId }

SERVER → CLIENT:
  chat:new_message     { message }
  chat:user_typing     { channelId, userId }
  notification:new     { notification }
  record:updated       { recordId, changes }
  announcement:new     { announcement }
```

### NestJS Module Pattern
```
modules/work-records/
├── work-records.module.ts
├── work-records.controller.ts
├── work-records.service.ts
├── dto/
│   ├── create-work-record.dto.ts
│   └── update-work-record.dto.ts
└── work-records.gateway.ts        (WebSocket)
```

---

## 7. UI/UX Concept

### Layout: Three-Column

```
┌──────────┬─────────────────────┬──────────┐
│ Sidebar  │   Main Content      │  Right   │
│ 220px    │   flex-1            │  Panel   │
│ fixed    │   scrollable        │  280px   │
│          │                     │          │
│ Nav      │   Breadcrumb + Search│ Notif.  │
│ items    │   Stats cards       │ Calendar │
│          │   Data table/cards  │ Downtime │
│          │                     │ Chat     │
│ User     │                     │ Maint.   │
└──────────┴─────────────────────┴──────────┘
```

### Responsive Strategy

| Breakpoint | Sidebar | Main | Right Panel |
|---|---|---|---|
| mobile (<768px) | hamburger overlay | 100% | hidden |
| md (≥768px) | hamburger overlay | 100% | hidden / bottom sheet |
| lg (≥1024px) | 220px visible | flex-1 | collapsed 48px icon strip |
| xl (≥1280px) | 220px visible | flex-1 | 280px visible |

Mobile-first approach using Tailwind breakpoint utilities (`md:`, `lg:`, `xl:`).

### Sidebar Navigation (role-based visibility)

| Section | Item | Seřizovač | Mistr | Vedoucí | Admin |
|---|---|---|---|---|---|
| Hlavní | Dashboard | + | + | + | + |
| | Evidence práce | + | + | — | + |
| | Stroje | read | full | read | full |
| | Kalendář | + | + | + | + |
| | Úkoly | own | all | — | all |
| | Statistiky | workshop | all | all+export | all |
| Komunikace | Chat | + | + | + | + |
| | Oznámení | read | manage | read | manage |
| Správa | Uživatelé | — | + | — | + |
| | Dílny / Týmy | — | + | — | + |
| | Směny | — | — | — | + |
| | Nastavení | — | — | — | + |
| | Audit log | — | workshop | — | + |
| | Koš | — | + | — | + |

### Dark / Light Mode
Tailwind `dark:` variant via `class` strategy on `<html>`. Toggle in sidebar footer. Saved in `localStorage` + user settings in DB. Theme switch animates with 300ms cross-fade transition on `background-color` and `color`.

### Visual Design Philosophy: Calming & Premium

The design must feel calming and pleasant — factory workers use this daily under stress, so the UI should feel like a quiet, professional space that reduces cognitive load.

**Core Aesthetic:**
- Soft gradients instead of flat solid colors
- Glassmorphism on cards and panels (backdrop-blur, semi-transparent backgrounds)
- Smooth animations on every interaction — nothing snaps, everything flows
- Generous whitespace and breathing room
- Rounded corners everywhere — no sharp edges
- Subtle depth via layered shadows and blur

### Color Palette

```
LIGHT MODE:
  Background:     linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)
  Surface:        rgba(255, 255, 255, 0.7) + backdrop-blur(12px)
  Surface hover:  rgba(255, 255, 255, 0.85)
  Text primary:   slate-800 (#1e293b)
  Text secondary: slate-500 (#64748b)

DARK MODE:
  Background:     linear-gradient(135deg, #0f172a 0%, #1a1033 50%, #0f172a 100%)
  Surface:        rgba(30, 41, 59, 0.6) + backdrop-blur(12px)
  Surface hover:  rgba(30, 41, 59, 0.8)
  Text primary:   slate-100 (#f1f5f9)
  Text secondary: slate-400 (#94a3b8)

ACCENT COLORS:
  Primary:        indigo-500 (#6366f1) → gradient to violet-500 (#8b5cf6)
  Primary hover:  indigo-400 (#818cf8) → violet-400 (#a78bfa)
  Danger:         rose-500 (#f43f5e)
  Warning:        amber-400 (#fbbf24)
  Success:        emerald-500 (#10b981)
  Info:           sky-400 (#38bdf8)

GRADIENT PRESETS:
  Primary button: linear-gradient(135deg, #6366f1, #8b5cf6)
  Sidebar active: linear-gradient(90deg, rgba(99,102,241,0.15), transparent)
  Card accent:    linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))
  Status bar:     linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)
```

### Glassmorphism System

```
Card / Panel:
  background: rgba(255, 255, 255, 0.7)    /* dark: rgba(30, 41, 59, 0.6) */
  backdrop-filter: blur(12px)
  border: 1px solid rgba(255, 255, 255, 0.2)
  border-radius: 16px
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06)

Modal / Overlay:
  background: rgba(255, 255, 255, 0.85)   /* dark: rgba(30, 41, 59, 0.8) */
  backdrop-filter: blur(20px)
  border-radius: 20px
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12)

Sidebar:
  background: rgba(255, 255, 255, 0.5)    /* dark: rgba(15, 23, 42, 0.7) */
  backdrop-filter: blur(16px)
  border-right: 1px solid rgba(255, 255, 255, 0.15)
```

### Animation System

All animations use `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind `ease-in-out`) unless specified otherwise. Nothing should feel instant — every state change has a transition.

```
MICRO-INTERACTIONS (250–350ms):
  Button hover:       scale(1.02), shadow increase, gradient shift
  Button press:       scale(0.98), 150ms
  Card hover:         translateY(-2px), shadow-lg, border glow
  Input focus:        border-color 250ms, ring glow expand
  Toggle switch:      spring animation, 300ms
  Checkbox:           scale bounce on check, 250ms
  Tooltip:            fadeIn + translateY(4px), 200ms
  Dropdown open:      scaleY from top, opacity, 250ms

PAGE TRANSITIONS (300–500ms):
  Page enter:         fadeIn + translateY(20px→0), 400ms
  Page exit:          fadeOut + translateY(0→-10px), 200ms
  Sidebar collapse:   width 300ms + content fade
  Modal open:         backdrop fade 200ms, modal scale(0.95→1) + fade 300ms
  Modal close:        modal scale(1→0.95) + fade 200ms, backdrop fade 150ms
  Tab switch:         content crossfade 250ms

STAGGER PATTERNS:
  List items:         each item delays +50ms (fadeIn + translateX(-10px))
  Dashboard cards:    each card delays +80ms (fadeIn + translateY(15px))
  Table rows:         each row delays +30ms (fadeIn + opacity)
  Sidebar nav items:  each delays +40ms on first load

CONTINUOUS (loops):
  Loading spinner:    rotate 360deg, 1s linear infinite
  Pulse dot:          scale(1→1.2→1), opacity(1→0.5→1), 2s ease infinite
  Skeleton shimmer:   gradient slide left→right, 1.5s ease infinite
  Status indicator:   subtle pulse glow, 3s ease infinite

SPECIAL:
  Theme toggle:       sun↔moon icon morph, background crossfade 300ms
  Notification bell:  subtle swing on new notification, 400ms
  Success checkmark:  draw SVG path, 500ms ease-out
  Error shake:        translateX(-4px→4px→0), 300ms, 2 cycles
```

### Tailwind Implementation

```tsx
/* tailwind.config.ts — extended theme */
animation: {
  'fade-in':       'fadeIn 400ms ease-out forwards',
  'fade-in-up':    'fadeInUp 400ms ease-out forwards',
  'slide-in':      'slideIn 300ms ease-out forwards',
  'scale-in':      'scaleIn 300ms ease-out forwards',
  'shimmer':       'shimmer 1.5s ease infinite',
  'pulse-soft':    'pulseSoft 3s ease infinite',
  'swing':         'swing 400ms ease-in-out',
}

/* Glass card component pattern */
className="
  bg-white/70 dark:bg-slate-800/60
  backdrop-blur-xl
  border border-white/20 dark:border-slate-700/30
  rounded-2xl
  shadow-[0_4px_24px_rgba(0,0,0,0.06)]
  dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
  transition-all duration-300
  hover:shadow-lg hover:-translate-y-0.5
  hover:bg-white/80 dark:hover:bg-slate-800/70
"

/* Primary gradient button */
className="
  bg-gradient-to-r from-indigo-500 to-violet-500
  hover:from-indigo-400 hover:to-violet-400
  text-white font-medium
  rounded-xl px-5 py-2.5
  shadow-md shadow-indigo-500/25
  transition-all duration-300
  hover:shadow-lg hover:shadow-indigo-500/30
  hover:scale-[1.02]
  active:scale-[0.98] active:duration-150
"
```

### Design Tokens

```
Radius:     rounded-xl (12px) buttons, rounded-2xl (16px) cards, rounded-3xl (24px) modals
Shadows:    shadow-sm+blur cards, shadow-md dropdowns, shadow-lg modals, shadow-xl overlays
Spacing:    gap-1.5 (label/input), gap-4 (fields), gap-6 (sections), gap-8 (page sections)
Font:       Inter (UI text), JetBrains Mono (code/numbers)
```

### Branding Configuration (Admin Settings)

Since this is a universal template, the factory brand is configurable:
- Company name (shown in sidebar header, login page, page title)
- Company logo (SVG upload, shown in sidebar + login)
- Primary accent color (overrides indigo-500 via CSS custom properties)
- Login page background image (optional)

Stored in `settings` table, loaded on app init, applied via CSS custom properties on `:root`.

### Frontend Code Conventions
- Minimal comments — only when WHY is non-obvious
- UI text in Czech, code identifiers in English
- Every section wrapped in `<div className="flex ...">` as flexbox container
- Small files (80–120 lines), file name = documentation
- `flex flex-col md:flex-row` pattern for responsive layouts
- `flex-wrap` + `min-w-[...]` for adaptive grids without extra media queries
- Generous whitespace: `gap-1.5` label/input, `gap-4` fields, `gap-6` sections
- All interactive elements have `transition-all duration-300`
- Never remove animations, never add `prefers-reduced-motion` guards

---

## 8. Security Model

| Mechanism | Implementation |
|---|---|
| Passwords | bcrypt (12 rounds), minimum 8 characters |
| JWT Access Token | 15 minutes, `Authorization: Bearer` header |
| JWT Refresh Token | 7 days, httpOnly secure cookie |
| Token refresh | Auto via axios interceptor on 401 |
| Session expiry | Refresh token removed from Redis → re-login |
| Authorization | NestJS Guards: `RolesGuard` + `PermissionsGuard` |
| Input validation | Zod schemas (shared FE/BE), NestJS `ZodValidationPipe` |
| CORS | Whitelist frontend domain only |
| Rate limiting | `@nestjs/throttler`: 100 req/min general, 10 req/min auth |
| File uploads | MIME type check + size limit (10MB image, 50MB doc), sanitize filename |
| SQL injection | Prisma parameterized queries (default) |
| XSS | React auto-escaping + DOMPurify for chat HTML |
| Audit | `AuditInterceptor` — every POST/PATCH/DELETE logged automatically |
| Soft delete | Physical deletion after 30 days (cron job) |

---

## 9. Development Phases

### Phase 1 — MVP Core (4–6 weeks)

| # | Module | Scope |
|---|---|---|
| 1 | Project setup | Monorepo, Vite, NestJS, Prisma, Docker Compose, PostgreSQL, Redis |
| 2 | Auth | Login/logout, JWT, refresh token, session management |
| 3 | Users & Roles | CRUD users, 4 roles, granular permissions, profiles |
| 4 | Workshops / Lines / Machines | CRUD, photos, responsibles, catalog |
| 5 | Evidence práce | Create/edit/delete records, categories, drafts, templates |
| 6 | Dashboard | Today stats, recent records, quick actions |
| 7 | Layout | Sidebar, main content, responsive, dark mode |
| 8 | Audit log | Automatic logging of all actions |
| 9 | Trash | Soft delete, trash bin, restore |

### Phase 2 — Communication & Planning (3–4 weeks)

| # | Module | Scope |
|---|---|---|
| 1 | Chat | Channels (workshops), private/group conversations, photo/video, bookmarks |
| 2 | Notifications | Real-time via WebSocket, notification list |
| 3 | Announcements | Create/view, priorities, expiry |
| 4 | Tasks | Personal list, assign to others, deadline, priority |
| 5 | Calendar | Interactive calendar, create events, filters |
| 6 | Attachments | Upload to MinIO, preview, download |

### Phase 3 — Analytics & Reports (2–3 weeks)

| # | Module | Scope |
|---|---|---|
| 1 | Statistics | Charts (Recharts), KPI, period filters |
| 2 | Machine history | Machine page, history, failure frequency, total downtime |
| 3 | Reports | PDF/Excel/CSV generation (BullMQ background jobs) |
| 4 | Maintenance planner | Preventive maintenance scheduling |
| 5 | Global search | Full-text search via PostgreSQL `tsvector` |

### Phase 4 — Polish & Production (1–2 weeks)

| # | Scope |
|---|---|
| 1 | E2E tests (Playwright) |
| 2 | Performance optimization (query optimization, indexes) |
| 3 | Docker production config, Nginx SSL |
| 4 | Seed script (Admin + Mistr accounts) |
| 5 | Deployment documentation |
| 6 | Backup strategy (pg_dump cron) |

---

## 10. First Admin & Mistr Setup

### Option A: Seed Script (automatic)

```bash
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
```

Creates:
- **Admin:** `admin@evidence.local` / password: `admin`
- **Mistr:** `mistr@evidence.local` / password: `admin`
- Default shifts (Ranní, Odpolední, Noční)
- System roles (Administrátor, Mistr, Seřizovač, Vedoucí výroby)
- Default settings (company name: "Evidence", empty logo)

First login forces password change.

### Option B: CLI Command (manual)

```bash
pnpm --filter api cli:create-user \
  --email admin@evidence.local \
  --name "Admin" \
  --role administrator

pnpm --filter api cli:create-user \
  --email mistr@evidence.local \
  --name "Hlavní Mistr" \
  --role mistr
```

### After setup:
1. Open `http://server-ip:3000`
2. Login as Admin
3. Change password
4. Create workshops (Dílny)
5. Add production lines and machines
6. Create accounts for mistrs and seřizovačs via UI

---

## 11. Future Improvements

- Active Directory / LDAP integration
- ERP system integration (REST API)
- Power BI connector
- Email notifications (SMTP)
- Push notifications (Web Push API)
- Offline mode with local storage sync
- QR codes on machines for quick record creation
- Mobile camera integration for photo attachments
- Barcode/QR scanner for parts tracking
- Multi-factory support (tenant per factory)
- White-label theming (custom colors, fonts, logos per deployment)
- Localization beyond Czech (i18n-ready architecture)

---

## 12. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Chat module complexity | Delays Phase 2 | Chat is Phase 2, not MVP. Core works without it |
| On-premise server failure | Downtime | Docker restart policies, pg_dump daily backups |
| File storage growth | Disk full | MinIO monitoring, old attachment cleanup policy |
| WebSocket scaling (50-200 users) | Connection drops | Redis pub/sub adapter for Socket.io |
| Czech text search accuracy | Poor search results | PostgreSQL unaccent + cs_CZ tsvector config |
| Single developer bottleneck | Slow progress | Modular architecture allows parallel work on modules |
