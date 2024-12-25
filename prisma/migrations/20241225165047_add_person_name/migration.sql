/*
  Warnings:

  - Added the required column `personName` to the `Charge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personName` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "personName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "personName" TEXT NOT NULL;
