/*
  Warnings:

  - Added the required column `accountType` to the `BankTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PROPRIETOR', 'BUSINESS', 'GENERAL');

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN     "accountType" "AccountType" NOT NULL;
