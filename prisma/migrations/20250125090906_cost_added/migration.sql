-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER');

-- CreateTable
CREATE TABLE "Costs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255),
    "category" "Category" NOT NULL,
    "billImage" TEXT NOT NULL,
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Costs_id_key" ON "Costs"("id");
