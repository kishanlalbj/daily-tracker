/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isDeleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
