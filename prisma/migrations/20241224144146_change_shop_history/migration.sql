/*
  Warnings:

  - The values [ownership,activePeriod,deactivePeriod,rental] on the enum `HistoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HistoryType_new" AS ENUM ('ActiveByOwner', 'ActiveByRenter', 'InActive', 'Ownership');
ALTER TABLE "ShopHistory" ALTER COLUMN "type" TYPE "HistoryType_new" USING ("type"::text::"HistoryType_new");
ALTER TYPE "HistoryType" RENAME TO "HistoryType_old";
ALTER TYPE "HistoryType_new" RENAME TO "HistoryType";
DROP TYPE "HistoryType_old";
COMMIT;
