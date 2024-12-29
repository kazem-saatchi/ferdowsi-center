/*
  Warnings:

  - You are about to drop the column `metericAmount` on the `ShopChargeReference` table. All the data in the column will be lost.
  - Added the required column `metricAmount` to the `ShopChargeReference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopChargeReference" DROP COLUMN "metericAmount",
ADD COLUMN     "metricAmount" INTEGER NOT NULL;
