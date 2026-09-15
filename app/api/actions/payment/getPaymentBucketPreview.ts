"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { BALANCE_BUCKETS } from "@/utils/dashboardStats";
import { Person } from "@prisma/client";
import { resolveShopPersonAtDate } from "./resolveOccupant";

export interface PaymentBucketPreview {
  /** Who the payment would belong to in each bucket, resolved on the payment's
   *  own date. Null for a bucket this shop type has no list for. */
  proprietorPersonName: string | null;
  monthlyPersonName: string | null;
  /** False when no ShopHistory row covers the payment date, so the answer fell
   *  back to the shop's current state and is a guess rather than a record. */
  fromHistory: boolean;
}

/**
 * Both answers the "also change the person" checkbox could produce, fetched
 * once when the dialog opens so toggling the bucket does not re-query.
 *
 * Read-only, but ADMIN-only like the update it previews: it discloses who held
 * a unit on a past date.
 */
async function getPaymentBucketPreview(
  paymentId: string,
  person: Person
): Promise<PaymentBucketPreview> {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: { date: true, shopId: true },
  });

  if (!payment) {
    throw new Error(errorMSG.paymentNotFound);
  }

  const shop = await db.shop.findUnique({
    where: { id: payment.shopId },
    select: {
      id: true,
      type: true,
      ownerId: true,
      ownerName: true,
      renterId: true,
      renterName: true,
    },
  });

  if (!shop) {
    throw new Error(errorMSG.shopNotFound);
  }

  const monthlyAvailable = BALANCE_BUCKETS.monthly.types.includes(shop.type);

  const [asProprietor, asMonthly] = await Promise.all([
    resolveShopPersonAtDate(db, shop, payment.date, true),
    monthlyAvailable
      ? resolveShopPersonAtDate(db, shop, payment.date, false)
      : null,
  ]);

  return {
    proprietorPersonName: asProprietor.personName,
    monthlyPersonName: asMonthly?.personName ?? null,
    // The proprietor branch short-circuits without reading history on
    // STORE/OFFICE, so the monthly lookup is the one that says whether the date
    // is actually covered.
    fromHistory: asMonthly?.fromHistory ?? asProprietor.fromHistory,
  };
}

export default async function getPaymentBucketPreviewAction(paymentId: string) {
  return handleServerAction<PaymentBucketPreview>((person) =>
    getPaymentBucketPreview(paymentId, person)
  );
}
