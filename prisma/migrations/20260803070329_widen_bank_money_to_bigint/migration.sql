-- Widen rial money columns from INT4 to INT8.
--
-- Why: the proprietor account's running balance passed INT4's ceiling of
-- 2,147,483,647 in 1405/04. Every statement row above it failed to insert with
-- "Unable to fit integer value into an INT4", the importer swallowed the error,
-- and the rows vanished — 1,019,874,268 rial of payments across 23 plaques went
-- unrecorded before this was traced.
--
-- Shop.sellAmount and Shop.rentMortgage are widened for the same reason before
-- they can bite: a shop sale price or a رهن in rial is routinely past INT4.
--
-- Widening int4 -> int8 is non-lossy and needs no data migration. Postgres
-- rewrites the table under an ACCESS EXCLUSIVE lock; at 3,329 and 201 rows this
-- is effectively instant.
--
-- Charge/Payment/Cost/Income.amount stay INT4 deliberately — they are an order
-- of magnitude below the ceiling and are summed throughout the balance engine,
-- where mixing bigint with number would throw. utils/bankAmount.ts guards the
-- two places bank money crosses into them.

-- AlterTable
ALTER TABLE "BankTransaction" ALTER COLUMN "amount" SET DATA TYPE BIGINT,
ALTER COLUMN "balance" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "rentMortgage" SET DATA TYPE BIGINT,
ALTER COLUMN "sellAmount" SET DATA TYPE BIGINT;
