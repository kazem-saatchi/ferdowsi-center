/*
  Warnings:

  - Added the required column `bankCardMonthly` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankCardYearly` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "bankCardMonthly" TEXT NOT NULL,
ADD COLUMN     "bankCardYearly" TEXT NOT NULL;
