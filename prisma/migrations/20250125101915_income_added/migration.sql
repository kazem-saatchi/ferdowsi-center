/*
  Warnings:

  - You are about to drop the `Costs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Costs";

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "category" "Category" NOT NULL,
    "billImage" TEXT NOT NULL,
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
    "billImage" TEXT NOT NULL,
    "proprietor" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cost_id_key" ON "Cost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Income_id_key" ON "Income"("id");
