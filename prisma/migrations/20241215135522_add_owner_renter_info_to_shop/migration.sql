/*
  Warnings:

  - A unique constraint covering the columns `[plaque]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "ownerName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "renterName" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Shop_plaque_key" ON "Shop"("plaque");
