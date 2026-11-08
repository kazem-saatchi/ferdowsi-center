"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { SafePerson } from "@/schema/personSchema";
import { ShopType } from "@prisma/client";

/** Charge, payment and charge − payment for one slice of a unit's ledger. */
export interface LedgerTotals {
  charge: number;
  payment: number;
  /** charge − payment: positive means money is still owed. */
  balance: number;
}

/** A unit's monthly ledger split between its current renter and its owner, by
 *  the rule in utils/monthlyChargeShare.ts: the renter's share is what was
 *  charged to and paid by the current renter; everything else — the owner's
 *  own rows and whatever previous renters left behind — is the owner's. */
export interface MonthlyRenterShare {
  renterName: string;
  ownerName: string;
  renter: LedgerTotals;
  owner: LedgerTotals;
}

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
  /** The unit totals split by the `proprietor` flag: monthly (ماهانه) and
   *  proprietor (مالکانه). Together they add up to totalCharge / totalPayment /
   *  balance. */
  monthly: LedgerTotals;
  proprietor: LedgerTotals;
  /** Set only when the unit has a renter who is not also its owner; the two
   *  shares add up to `monthly`. */
  monthlyShare: MonthlyRenterShare | null;
}

export interface PersonBalanceSummary {
  unitCount: number;
  /** Units carrying a debt, i.e. a positive balance. */
  debtUnitCount: number;
  totalCharge: number;
  totalPayment: number;
  balance: number;
  monthly: LedgerTotals;
  proprietor: LedgerTotals;
}

interface FindBalanceResponse {
  success: boolean;
  message: string;
  person: SafePerson;
  summary: PersonBalanceSummary;
  units: PersonUnitBalance[];
}

function ledgerTotals(charge: number, payment: number): LedgerTotals {
  return { charge, payment, balance: charge - payment };
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
  if (
    person.id !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "MANAGER"
  ) {
    throw new Error(errorMSG.unauthorized);
  }

  const shops = await db.shop.findMany({
    where: { OR: [{ ownerId: person.id }, { renterId: person.id }] },
    orderBy: { plaque: "asc" },
    select: {
      id: true,
      plaque: true,
      type: true,
      ownerId: true,
      renterId: true,
      ownerName: true,
      renterName: true,
    },
  });

  const shopIds = shops.map((shop) => shop.id);
  const renterOf = new Map(shops.map((shop) => [shop.id, shop.renterId]));

  // Two grouped queries cover every unit. Grouping by personId and proprietor
  // as well gets the unit total, this person's share and the monthly/مالکانه
  // split out of the same scan, instead of several aggregates per unit.
  const [chargeRows, paymentRows] = shopIds.length
    ? await Promise.all([
        db.charge.groupBy({
          by: ["shopId", "personId", "proprietor"],
          where: { shopId: { in: shopIds } },
          _sum: { amount: true },
        }),
        db.payment.groupBy({
          by: ["shopId", "personId", "proprietor"],
          where: { shopId: { in: shopIds } },
          _sum: { amount: true },
        }),
      ])
    : [[], []];

  const tally = <
    T extends {
      shopId: string;
      personId: string;
      proprietor: boolean;
      _sum: { amount: number | null };
    },
  >(
    rows: T[]
  ) => {
    const total = new Map<string, number>();
    const own = new Map<string, number>();
    const proprietor = new Map<string, number>();
    /** Monthly rows booked to the unit's current renter. */
    const renterMonthly = new Map<string, number>();
    const add = (map: Map<string, number>, key: string, amount: number) =>
      map.set(key, (map.get(key) ?? 0) + amount);
    rows.forEach((row) => {
      const amount = row._sum.amount ?? 0;
      add(total, row.shopId, amount);
      if (row.personId === person.id) add(own, row.shopId, amount);
      if (row.proprietor) add(proprietor, row.shopId, amount);
      else if (row.personId === renterOf.get(row.shopId)) {
        add(renterMonthly, row.shopId, amount);
      }
    });
    return { total, own, proprietor, renterMonthly };
  };

  const charged = tally(chargeRows);
  const paid = tally(paymentRows);

  const units: PersonUnitBalance[] = shops.map((shop) => {
    const totalCharge = charged.total.get(shop.id) ?? 0;
    const totalPayment = paid.total.get(shop.id) ?? 0;
    const proprietorCharge = charged.proprietor.get(shop.id) ?? 0;
    const proprietorPayment = paid.proprietor.get(shop.id) ?? 0;
    const monthly = ledgerTotals(
      totalCharge - proprietorCharge,
      totalPayment - proprietorPayment
    );

    // An owner renting their own unit has nobody to split with.
    let monthlyShare: MonthlyRenterShare | null = null;
    if (shop.renterId && shop.renterId !== shop.ownerId) {
      const renter = ledgerTotals(
        charged.renterMonthly.get(shop.id) ?? 0,
        paid.renterMonthly.get(shop.id) ?? 0
      );
      monthlyShare = {
        renterName: shop.renterName ?? "",
        ownerName: shop.ownerName,
        renter,
        owner: ledgerTotals(
          monthly.charge - renter.charge,
          monthly.payment - renter.payment
        ),
      };
    }

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
      monthly,
      proprietor: ledgerTotals(proprietorCharge, proprietorPayment),
      monthlyShare,
    };
  });

  const sumOf = (pick: (unit: PersonUnitBalance) => LedgerTotals) =>
    ledgerTotals(
      units.reduce((sum, unit) => sum + pick(unit).charge, 0),
      units.reduce((sum, unit) => sum + pick(unit).payment, 0)
    );

  const summary: PersonBalanceSummary = {
    unitCount: units.length,
    debtUnitCount: units.filter((unit) => unit.balance > 0).length,
    totalCharge: units.reduce((sum, unit) => sum + unit.totalCharge, 0),
    totalPayment: units.reduce((sum, unit) => sum + unit.totalPayment, 0),
    balance: units.reduce((sum, unit) => sum + unit.balance, 0),
    monthly: sumOf((unit) => unit.monthly),
    proprietor: sumOf((unit) => unit.proprietor),
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
