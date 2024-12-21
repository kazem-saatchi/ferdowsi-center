/*
  Warnings:

  - Added the required column `personName` to the `ShopHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plaque` to the `ShopHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopHistory" ADD COLUMN     "personName" TEXT NOT NULL,
ADD COLUMN     "plaque" INTEGER NOT NULL;
