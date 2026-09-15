"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { SafePerson } from "@/schema/personSchema";
import { ShopType } from "@prisma/client";

/** One unit this person holds, with the unit's own totals — not the slice that
 *  happens to carry this person's id.
 *
 *  An unpaid charge stays with the unit when it changes hands, so the figure an
 *  admin needs here is everything ever billed to the unit. Filtering the ledger
 *  by personId hid the previous holder's arrears and made this page disagree
 *  with every other balance view in the app. `ownCharge`/`ownPayment` keep that
 *  slice available for a dispute without it standing in for the balance. */
export interface PersonUnitBalance {
  shopId: string;
  plaque: number;
  type: ShopType;
  /** How the person is attached to the unit; both are possible. */
  isOwner: boolean;
  isRenter: boolean;
  /** Every charge on the unit, whoever it was raised against. */
  totalCharge: number;
  totalPayment: number;
  /** charge − payment: positive means the unit still owes money. */
  balance: number;
  /** The part of the ledger raised against this person. */
  ownCharge: number;
  ownPayment: number;
}

export interface PersonBalanceSummary {
  unitCount: number;
  /** Units carrying a debt, i.e. a positive balance. */
  debtUnitCount: number;
  totalCharge: number;
  totalPayment: number;
  balance: number;
}

interface FindBalanceResponse {
  success: boolean;
  message: string;
  person: SafePerson;
  summary: PersonBalanceSummary;
  units: PersonUnitBalance[];
}

async function getPersonBalance(
  personId: string,
  user: SafePerson
): Promise<FindBalanceResponse> {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  const person = await db.person.findUnique({
    where: { id: personId },
    omit: { password: true },
  });

  if (!person) {
    throw new Error(errorMSG.personNotFound);
  }

  // Check authentication
  if (person.id !== user.id && user.role !== "ADMIN") {
    throw new Error(errorMSG.unauthorized);
  }

  const shops = await db.shop.findMany({
    where: { OR: [{ ownerId: person.id }, { renterId: person.id }] },
    orderBy: { plaque: "asc" },
    select: { id: true, plaque: true, type: true, ownerId: true, renterId: true },
  });

  const shopIds = shops.map((shop) => shop.id);

  // Two grouped queries cover every unit. Grouping by personId as well gets the
  // unit total and this person's share out of the same scan, instead of four
  // aggregates per unit.
  const [chargeRows, paymentRows] = shopIds.length
    ? await Promise.all([
        db.charge.groupBy({
          by: ["shopId", "personId"],
          where: { shopId: { in: shopIds } },
          _sum: { amount: true },
        }),
        db.payment.groupBy({
          by: ["shopId", "personId"],
          where: { shopId: { in: shopIds } },
          _sum: { amount: true },
        }),
      ])
    : [[], []];

  const tally = <T extends { shopId: string; personId: string; _sum: { amount: number | null } }>(
    rows: T[]
  ) => {
    const total = new Map<string, number>();
    const own = new Map<string, number>();
    rows.forEach((row) => {
      const amount = row._sum.amount ?? 0;
      total.set(row.shopId, (total.get(row.shopId) ?? 0) + amount);
      if (row.personId === person.id) {
        own.set(row.shopId, (own.get(row.shopId) ?? 0) + amount);
      }
    });
    return { total, own };
  };

  const charged = tally(chargeRows);
  const paid = tally(paymentRows);

  const units: PersonUnitBalance[] = shops.map((shop) => {
    const totalCharge = charged.total.get(shop.id) ?? 0;
    const totalPayment = paid.total.get(shop.id) ?? 0;
    return {
      shopId: shop.id,
      plaque: shop.plaque,
      type: shop.type,
      isOwner: shop.ownerId === person.id,
      isRenter: shop.renterId === person.id,
      totalCharge,
      totalPayment,
      balance: totalCharge - totalPayment,
      ownCharge: charged.own.get(shop.id) ?? 0,
      ownPayment: paid.own.get(shop.id) ?? 0,
    };
  });

  const summary: PersonBalanceSummary = {
    unitCount: units.length,
    debtUnitCount: units.filter((unit) => unit.balance > 0).length,
    totalCharge: units.reduce((sum, unit) => sum + unit.totalCharge, 0),
    totalPayment: units.reduce((sum, unit) => sum + unit.totalPayment, 0),
    balance: units.reduce((sum, unit) => sum + unit.balance, 0),
  };

  return {
    success: true,
    message: successMSG.balancesFound,
    person,
    summary,
    units,
  };
}

export default async function findBalanceByPerson(data: { personId: string }) {
  return handleServerAction<FindBalanceResponse>((user) =>
    getPersonBalance(data.personId, user)
  );
}
