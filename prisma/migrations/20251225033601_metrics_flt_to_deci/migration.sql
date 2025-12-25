/*
  Warnings:

  - You are about to alter the column `amount` on the `ExpenseTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `weight` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `height` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `waist` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `neck` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `bmi` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `bodyFat` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `bodyFatWeight` on the `HealthTracker` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "ExpenseTracker" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "HealthTracker" ALTER COLUMN "weight" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "height" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "waist" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "neck" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "bmi" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "bodyFat" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "bodyFatWeight" SET DATA TYPE DECIMAL(65,30);
