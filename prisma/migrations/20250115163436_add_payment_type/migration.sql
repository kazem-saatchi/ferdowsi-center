-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CHEQUE', 'POS_MACHINE', 'BANK_TRANSFER', 'OTHER');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "description" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "receiptImageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'CASH';
