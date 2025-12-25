-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'unknown');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender" DEFAULT 'unknown';
