-- AlterTable: add shift_id to users
ALTER TABLE "users" ADD COLUMN "shift_id" UUID;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_shift_id_idx" ON "users"("shift_id");
