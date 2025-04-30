/*
  Warnings:

  - The values [OTHER] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PAYMENT', 'COST', 'INCOME');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'PAYMENT');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('KIOSK', 'MONTHLY', 'YEARLY', 'RENT', 'SELL', 'ADVERTISMENT', 'CONTRACT_FEE', 'OTHER_INCOME', 'ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER', 'CLEANING', 'SECURITY', 'SALARY', 'UTILITIES', 'TAX', 'OTHER_PAYMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER', 'CLEANING', 'SECURITY', 'SALARY', 'UTILITIES', 'TAX', 'OTHER_PAYMENT');
ALTER TABLE "Cost" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "kioskRentAmount" INTEGER;

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "recieverAccount" TEXT,
    "senderAccount" TEXT,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceId" TEXT,
    "referenceType" "ReferenceType",

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankTransaction_recieverAccount_idx" ON "BankTransaction"("recieverAccount");

-- CreateIndex
CREATE INDEX "BankTransaction_date_idx" ON "BankTransaction"("date");

-- CreateIndex
CREATE INDEX "BankTransaction_referenceId_idx" ON "BankTransaction"("referenceId");
