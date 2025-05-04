/*
  Warnings:

  - Added the required column `bankReferenceId` to the `BankTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN     "bankReferenceId" TEXT NOT NULL,
ADD COLUMN     "registered" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "category" DROP NOT NULL;
