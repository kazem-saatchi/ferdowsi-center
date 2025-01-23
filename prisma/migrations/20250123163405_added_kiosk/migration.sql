/*
  Warnings:

  - A unique constraint covering the columns `[shopId,proprietor]` on the table `ShopChargeReference` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ShopType" ADD VALUE 'KIOSK';

-- DropIndex
DROP INDEX "ShopChargeReference_shopId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ShopChargeReference_shopId_proprietor_key" ON "ShopChargeReference"("shopId", "proprietor");
