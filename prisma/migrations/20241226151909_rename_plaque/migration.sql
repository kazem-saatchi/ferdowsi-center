-- AlterTable
ALTER TABLE "ShopChargeReference" ADD COLUMN     "year" INTEGER NOT NULL DEFAULT 2024;

-- CreateIndex
CREATE INDEX "ShopChargeReference_shopId_idx" ON "ShopChargeReference"("shopId");

-- CreateIndex
CREATE INDEX "ShopChargeReference_year_idx" ON "ShopChargeReference"("year");

-- AddForeignKey
ALTER TABLE "ShopChargeReference" ADD CONSTRAINT "ShopChargeReference_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
