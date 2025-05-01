-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('STORE', 'OFFICE', 'KIOSK', 'PARKING', 'BOARD');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'STAFF', 'USER');

-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('ActiveByOwner', 'ActiveByRenter', 'InActive', 'Ownership');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CHEQUE', 'POS_MACHINE', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER', 'CLEANING', 'SECURITY', 'SALARY', 'UTILITIES', 'TAX', 'OTHER_PAYMENT');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PAYMENT', 'COST', 'INCOME');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'PAYMENT');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('KIOSK', 'MONTHLY', 'YEARLY', 'RENT', 'SELL', 'ADVERTISMENT', 'CONTRACT_FEE', 'OTHER_INCOME', 'ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER', 'CLEANING', 'SECURITY', 'SALARY', 'UTILITIES', 'TAX', 'OTHER_PAYMENT');

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "floor" INTEGER NOT NULL,
    "type" "ShopType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "renterId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerName" TEXT NOT NULL DEFAULT '',
    "renterName" TEXT,
    "isForRent" BOOLEAN NOT NULL DEFAULT false,
    "rentAmount" INTEGER NOT NULL DEFAULT 0,
    "rentMortgage" INTEGER NOT NULL DEFAULT 0,
    "isForSell" BOOLEAN NOT NULL DEFAULT false,
    "sellAmount" INTEGER NOT NULL DEFAULT 0,
    "bankCardMonthly" TEXT NOT NULL,
    "bankCardYearly" TEXT NOT NULL,
    "description" TEXT,
    "kioskRentAmount" INTEGER,
    "koistChargeAmount" INTEGER,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "phoneOne" TEXT NOT NULL,
    "phoneTwo" TEXT,
    "IdNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "address" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopHistory" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "type" "HistoryType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shopType" "ShopType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "shopId" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "operationId" TEXT NOT NULL,
    "operationName" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "shopId" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "type" "PaymentType" NOT NULL DEFAULT 'CASH',
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "receiptImageUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopChargeReference" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "plaque" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "constantAmount" INTEGER NOT NULL,
    "metricAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopChargeReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "category" "Category" NOT NULL,
    "billImage" TEXT NOT NULL DEFAULT '',
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "billImage" TEXT NOT NULL DEFAULT '',
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Shop_id_key" ON "Shop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_plaque_key" ON "Shop"("plaque");

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

-- CreateIndex
CREATE UNIQUE INDEX "ShopChargeReference_id_key" ON "ShopChargeReference"("id");

-- CreateIndex
CREATE INDEX "ShopChargeReference_shopId_idx" ON "ShopChargeReference"("shopId");

-- CreateIndex
CREATE INDEX "ShopChargeReference_year_idx" ON "ShopChargeReference"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ShopChargeReference_shopId_proprietor_key" ON "ShopChargeReference"("shopId", "proprietor");

-- CreateIndex
CREATE UNIQUE INDEX "Cost_id_key" ON "Cost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Income_id_key" ON "Income"("id");

-- CreateIndex
CREATE INDEX "BankTransaction_recieverAccount_idx" ON "BankTransaction"("recieverAccount");

-- CreateIndex
CREATE INDEX "BankTransaction_date_idx" ON "BankTransaction"("date");

-- CreateIndex
CREATE INDEX "BankTransaction_referenceId_idx" ON "BankTransaction"("referenceId");

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

-- AddForeignKey
ALTER TABLE "ShopChargeReference" ADD CONSTRAINT "ShopChargeReference_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
