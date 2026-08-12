-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('department', 'direct', 'group');

-- CreateTable: announcements
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'low',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable: chat_channels
CREATE TABLE "chat_channels" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "type" "ChannelType" NOT NULL,
    "workshop_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chat_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable: chat_members
CREATE TABLE "chat_members" (
    "channel_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("channel_id","user_id")
);

-- CreateTable: chat_messages
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_is_active_created_at_idx" ON "announcements"("is_active", "created_at");

-- CreateIndex
CREATE INDEX "chat_channels_type_idx" ON "chat_channels"("type");

-- CreateIndex
CREATE INDEX "chat_messages_channel_id_created_at_idx" ON "chat_messages"("channel_id", "created_at");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "chat_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "chat_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
