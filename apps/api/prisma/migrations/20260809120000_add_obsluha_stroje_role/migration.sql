-- AlterEnum: add obsluha_stroje to RoleSlug
ALTER TYPE "RoleSlug" ADD VALUE IF NOT EXISTS 'obsluha_stroje';
