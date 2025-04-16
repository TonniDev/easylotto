/*
  Warnings:

  - Added the required column `name` to the `saved_games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "saved_games" ADD COLUMN     "name" VARCHAR NOT NULL,
ADD COLUMN     "winning_lottery" INTEGER;
