/*
  Warnings:

  - You are about to drop the column `kioskRentAmount` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `koistChargeAmount` on the `Shop` table. All the data in the column will be lost.
  - Changed the type of `category` on the `Cost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'ELEVATOR', 'ESCALATOR', 'CHILLER', 'CLEANING', 'SECURITY', 'SALARY', 'UTILITIES', 'TAX', 'OTHER_PAYMENT');

-- AlterTable
ALTER TABLE "Cost" DROP COLUMN "category",
ADD COLUMN     "category" "CostCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "kioskRentAmount",
DROP COLUMN "koistChargeAmount",
ADD COLUMN     "ChargeAmount" INTEGER,
ADD COLUMN     "RentAmount" INTEGER,
ADD COLUMN     "rentDate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "Category";
