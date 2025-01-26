-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'CLEANING';
ALTER TYPE "Category" ADD VALUE 'SECURITY';
ALTER TYPE "Category" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Cost" ALTER COLUMN "billImage" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Income" ALTER COLUMN "billImage" SET DEFAULT '';
