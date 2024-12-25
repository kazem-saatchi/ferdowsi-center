/*
  Warnings:

  - Added the required column `operationName` to the `Charge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "operationName" TEXT NOT NULL;
