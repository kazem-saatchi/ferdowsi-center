import { HistoryType, Prisma, ShopType } from "@prisma/client";

/**
 * Resolves which person an automatically-registered bank transaction belongs
 * to, for a given transaction date.
 *
 * Monthly charges are generated from ShopHistory — i.e. from WHO OCCUPIED the
 * shop on each day — while automatic payment attribution used to read the
 * shop's CURRENT renter/owner. The two use different clocks, so a transaction
 * dated before an occupancy change landed on the wrong person and produced a
 * phantom credit on one side and a phantom debt on the other.
 *
 * This looks the occupant up by date instead. Note the limit of the approach:
 * it can only see occupancy that has already been recorded. When a tenancy is
 * registered after the fact (the common case in this building), no history row
 * covers the transaction date yet and we necessarily fall back to the shop's
 * current state — the same answer as before.
 */

const OCCUPANCY_TYPES: HistoryType[] = [
  HistoryType.ActiveByOwner,
  HistoryType.ActiveByRenter,
  HistoryType.InActive,
];

/**
 * Units the building management rents out. On these, `proprietor` does NOT mean
 * مالکانه — it marks the rent owed to the proprietor, and addRentAllKiosks bills
 * it to the occupant taken from ShopHistory (`forRent: true`). Their owner is a
 * single management person, so crediting proprietor payments to the owner the
 * way STORE/OFFICE do would charge the renter and pay the landlord.
 */
const RENTABLE_SHOP_TYPES: ShopType[] = [
  ShopType.KIOSK,
  ShopType.PARKING,
  ShopType.BOARD,
];

export function isRentableShopType(type: ShopType): boolean {
  return RENTABLE_SHOP_TYPES.includes(type);
}

export interface OccupantShop {
  id: string;
  type: ShopType;
  ownerId: string;
  ownerName: string;
  renterId: string | null;
  renterName: string | null;
}

export interface ResolvedOccupant {
  personId: string;
  personName: string;
  /** True when a history row covered the date; false when we fell back. */
  fromHistory: boolean;
}

export async function resolveShopPersonAtDate(
  tx: Prisma.TransactionClient,
  shop: OccupantShop,
  date: Date,
  isProprietor: boolean
): Promise<ResolvedOccupant> {
  // مالکانه follows ownership rather than occupancy, so it is never
  // date-resolved — but that is only true for STORE/OFFICE. On a rented-out
  // unit the same flag means rent, which the occupant owes, so it falls
  // through to the date lookup below like any monthly charge.
  if (isProprietor && !isRentableShopType(shop.type)) {
    return {
      personId: shop.ownerId,
      personName: shop.ownerName,
      fromHistory: false,
    };
  }

  // Spans are half-open — [startDate, endDate) — matching how the charge
  // generators split days, so a handover day belongs to the incoming person.
  const occupancy = await tx.shopHistory.findFirst({
    where: {
      shopId: shop.id,
      type: { in: OCCUPANCY_TYPES },
      startDate: { lte: date },
      OR: [{ endDate: null }, { endDate: { gt: date } }],
    },
    // Deterministic pick if spans ever overlap: the most recent one wins.
    orderBy: { startDate: "desc" },
    select: { personId: true, personName: true },
  });

  if (occupancy) {
    return {
      personId: occupancy.personId,
      personName: occupancy.personName,
      fromHistory: true,
    };
  }

  return {
    personId: shop.renterId || shop.ownerId,
    personName: shop.renterName || shop.ownerName,
    fromHistory: false,
  };
}
