-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('ownership', 'activePeriod', 'deactivePeriod', 'rental');

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "floor" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "renterId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "phoneOne" TEXT NOT NULL,
    "phoneTwo" TEXT,
    "IdNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopHistory" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "HistoryType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShopHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "pelaque" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "pelaque" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT NOT NULL,
    "shopId" TEXT,
    "personId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_id_key" ON "Shop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Person_id_key" ON "Person"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Person_IdNumber_key" ON "Person"("IdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShopHistory_id_key" ON "ShopHistory"("id");

-- CreateIndex
CREATE INDEX "ShopHistory_shopId_idx" ON "ShopHistory"("shopId");

-- CreateIndex
CREATE INDEX "ShopHistory_personId_idx" ON "ShopHistory"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_id_key" ON "Charge"("id");

-- CreateIndex
CREATE INDEX "Charge_operationId_idx" ON "Charge"("operationId");

-- CreateIndex
CREATE INDEX "Charge_shopId_idx" ON "Charge"("shopId");

-- CreateIndex
CREATE INDEX "Charge_personId_idx" ON "Charge"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "Payment"("id");

-- CreateIndex
CREATE INDEX "Payment_shopId_idx" ON "Payment"("shopId");

-- CreateIndex
CREATE INDEX "Payment_personId_idx" ON "Payment"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_id_key" ON "Operation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Log_id_key" ON "Log"("id");

-- CreateIndex
CREATE INDEX "Session_personId_idx" ON "Session"("personId");

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopHistory" ADD CONSTRAINT "ShopHistory_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopHistory" ADD CONSTRAINT "ShopHistory_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
