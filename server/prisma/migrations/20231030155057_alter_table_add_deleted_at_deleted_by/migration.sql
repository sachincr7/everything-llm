-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "document_vectors" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "welcome_messages" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "workspace_chats" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "workspace_documents" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "workspace_users" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedBy" INTEGER;
