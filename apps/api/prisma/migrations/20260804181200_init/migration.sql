-- CreateEnum
CREATE TYPE "RoleSlug" AS ENUM ('administrator', 'mistr', 'serizovac', 'vedouci_vyroby');

-- CreateEnum
CREATE TYPE "PermissionEnum" AS ENUM ('records.create', 'records.edit_all', 'records.delete', 'machines.manage', 'workshops.manage', 'teams.manage', 'users.manage', 'users.grant_permissions', 'announcements.manage', 'chat.create_channel', 'statistics.view_all', 'reports.generate', 'audit.view', 'settings.manage', 'trash.restore');

-- CreateEnum
CREATE TYPE "WorkRecordCategory" AS ENUM ('failure', 'maintenance', 'adjustment', 'cleaning', 'inspection', 'machine_setup', 'other');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "WorkRecordStatus" AS ENUM ('draft', 'open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('operational', 'maintenance', 'breakdown', 'decommissioned');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('create', 'update', 'delete', 'restore', 'login', 'logout');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" "RoleSlug" NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" UUID NOT NULL,
    "workshop_id" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "permission" "PermissionEnum" NOT NULL,
    "granted_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" UUID NOT NULL,
    "workshop_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" UUID NOT NULL,
    "line_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "photo_url" TEXT,
    "status" "MachineStatus" NOT NULL DEFAULT 'operational',
    "commissioned_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_responsibles" (
    "machine_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_responsibles_pkey" PRIMARY KEY ("machine_id","user_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "workshop_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id","user_id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_records" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "machine_id" UUID NOT NULL,
    "line_id" UUID NOT NULL,
    "shift_id" UUID,
    "category" "WorkRecordCategory" NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT,
    "duration_min" INTEGER,
    "description" TEXT NOT NULL,
    "downtime_min" INTEGER,
    "cause" TEXT,
    "maintenance_done" TEXT,
    "replaced_parts" TEXT,
    "required_parts" TEXT,
    "recommendations" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "WorkRecordStatus" NOT NULL DEFAULT 'open',
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_record_templates" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WorkRecordCategory" NOT NULL,
    "machine_id" UUID,
    "description" TEXT,
    "default_values" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_record_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_workshop_id_idx" ON "users"("workshop_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_key" ON "user_permissions"("user_id", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_code_key" ON "workshops"("code");

-- CreateIndex
CREATE UNIQUE INDEX "machines_code_key" ON "machines"("code");

-- CreateIndex
CREATE INDEX "work_records_date_machine_id_author_id_category_idx" ON "work_records"("date", "machine_id", "author_id", "category");

-- CreateIndex
CREATE INDEX "work_records_author_id_idx" ON "work_records"("author_id");

-- CreateIndex
CREATE INDEX "work_records_machine_id_idx" ON "work_records"("machine_id");

-- CreateIndex
CREATE INDEX "comments_entity_type_entity_id_idx" ON "comments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_responsibles" ADD CONSTRAINT "machine_responsibles_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_responsibles" ADD CONSTRAINT "machine_responsibles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_record_templates" ADD CONSTRAINT "work_record_templates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
