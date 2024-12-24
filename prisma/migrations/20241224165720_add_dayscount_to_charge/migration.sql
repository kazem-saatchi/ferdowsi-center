/*
  Warnings:

  - Added the required column `daysCount` to the `Charge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "daysCount" INTEGER NOT NULL;
