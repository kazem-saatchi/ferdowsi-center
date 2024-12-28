/*
  Warnings:

  - Added the required column `type` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('STORE', 'OFFICE');

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "type" "ShopType" NOT NULL;
