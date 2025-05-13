-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('CHARGE', 'BANK');

-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operationType" "OperationType" NOT NULL DEFAULT 'CHARGE';
