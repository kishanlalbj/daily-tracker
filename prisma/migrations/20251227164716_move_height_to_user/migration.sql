/*
  Warnings:

  - You are about to drop the column `height` on the `HealthTracker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthTracker" DROP COLUMN "height";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "height" DECIMAL;
