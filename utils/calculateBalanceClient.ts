import { ShopBalanceDetails, ShopsBalanceData } from "@/schema/balanceSchema";

/**
 * Client-safe helpers for the all-shops balance pages.
 *
 * The balances themselves are aggregated in Postgres by
 * app/api/actions/balance/getAllShopsBalance.ts — summing charge and payment
 * rows here meant shipping thousands of rows to the browser to produce ~174
 * numbers, so that work moved into the query.
 */

/**
 * Narrow ShopBalanceDetails to the shape the store's exports and balance
 * filter consume (they key off a single `balance` field).
 */
export function convertToShopsBalanceData(
  balances: ShopBalanceDetails[]
): ShopsBalanceData[] {
  return balances.map((balance) => ({
    plaque: balance.plaque,
    balance: balance.totalBalance,
    ownerName: balance.ownerName,
    renterName: balance.renterName,
  }));
}
