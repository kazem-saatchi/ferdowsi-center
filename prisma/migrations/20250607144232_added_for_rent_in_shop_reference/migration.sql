-- AlterTable
ALTER TABLE "Cost" ADD COLUMN     "bankTransactionId" TEXT;

-- AlterTable
ALTER TABLE "ShopChargeReference" ADD COLUMN     "forRent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "year" SET DEFAULT 2000;
