-- CreateTable
CREATE TABLE "ShopChargeReference" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "constantAmount" INTEGER NOT NULL,
    "metericAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopChargeReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopChargeReference_id_key" ON "ShopChargeReference"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopChargeReference_shopId_key" ON "ShopChargeReference"("shopId");
