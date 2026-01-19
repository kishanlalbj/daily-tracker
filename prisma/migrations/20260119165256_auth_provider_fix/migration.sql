-- AlterTable
ALTER TABLE "User" ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "provider" DROP DEFAULT;
