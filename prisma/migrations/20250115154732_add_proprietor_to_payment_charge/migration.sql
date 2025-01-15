/*
  Warnings:

  - Changed the type of `amount` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "proprietor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "proprietor" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShopChargeReference" ADD COLUMN     "proprietor" BOOLEAN NOT NULL DEFAULT false;
