/*
  Warnings:

  - Added the required column `bmi` to the `HealthTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyFat` to the `HealthTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyFatWeight` to the `HealthTracker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthTracker" ADD COLUMN     "bmi" INTEGER NOT NULL,
ADD COLUMN     "bodyFat" INTEGER NOT NULL,
ADD COLUMN     "bodyFatWeight" INTEGER NOT NULL;
