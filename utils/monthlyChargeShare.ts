import type { Charge, Payment } from "@prisma/client";

export interface MonthlyShare {
  /** Owed by whoever rents the shop today. */
  renter: number;
  /** The owner's own charges plus everything left behind by previous renters. */
  owner: number;
  total: number;
}

const sumAmounts = (rows: Array<{ amount: number }>) =>
  rows.reduce((total, row) => total + (row.amount || 0), 0);

/** Splits the monthly (non-proprietor) balance between the current renter and
 *  the owner. Anything booked to someone other than the current renter — the
 *  owner or a previous renter — falls to the owner, because unpaid charges
 *  follow the shop rather than the person who ran up the debt. */
export function calculateMonthlyShare(
  charges: Charge[],
  payments: Payment[],
  renterId?: string | null
): MonthlyShare {
  const monthlyCharges = charges.filter((charge) => !charge.proprietor);
  const monthlyPayments = payments.filter((payment) => !payment.proprietor);

  const total = sumAmounts(monthlyCharges) - sumAmounts(monthlyPayments);

  if (!renterId) {
    return { renter: 0, owner: total, total };
  }

  const renter =
    sumAmounts(monthlyCharges.filter((charge) => charge.personId === renterId)) -
    sumAmounts(
      monthlyPayments.filter((payment) => payment.personId === renterId)
    );

  return { renter, owner: total - renter, total };
}
