/*
  Warnings:

  - You are about to alter the column `valor_premio` on the `prizes` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "prizes" ALTER COLUMN "valor_premio" SET DATA TYPE DECIMAL(10,2);
