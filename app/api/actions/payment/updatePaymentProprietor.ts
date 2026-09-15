"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { BALANCE_BUCKETS } from "@/utils/dashboardStats";
import { Person } from "@prisma/client";
import { resolveShopPersonAtDate } from "./resolveOccupant";

export interface UpdatePaymentProprietorProps {
  paymentId: string;
  shopId: string;
  /** The bucket to move the payment into: true = مالکانه, false = ماهانه. */
  proprietor: boolean;
  /** Also move the payment to the person this bucket implies. Resolved on the
   *  payment's own date, never on the shop's current occupant — see below. */
  reassignPerson: boolean;
}

/**
 * Moves a payment between the monthly and مالکانه balance lists.
 *
 * The bucket is normally decided when the payment is created: the card-transfer
 * flow derives it from which bank card received the money
 * (addPaymentFromCard), which is wrong whenever a tenant pays one charge into
 * the other card. Until now the only repair was to delete the payment and
 * re-enter it by hand, which detached it from its bank row.
 *
 * Balances are live `groupBy` sums over (shopId, proprietor), so flipping the
 * flag is all that is needed to correct every balance list. Two things have to
 * travel with it, and both are easy to miss:
 *
 *  1. The bank row records the bucket too, as its category — both registration
 *     paths write `proprietor ? "YEARLY" : "MONTHLY"`. Left alone it keeps the
 *     old category and the bank report disagrees with the balance page.
 *
 *  2. On پارکینگ and تابلو there is no monthly list at all: every balance list
 *     for those types counts `proprietor: true` only. Moving such a payment to
 *     monthly would not move it to another list, it would remove it from all of
 *     them — the money would silently disappear. Rejected below.
 */
async function updatePaymentProprietor(
  data: UpdatePaymentProprietorProps,
  person: Person
) {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const { paymentId, shopId, proprietor, reassignPerson } = data;

  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new Error(errorMSG.paymentNotFound);
    }

    // The shop comes from the page the admin is looking at; refuse if it does
    // not match the payment, the same way updatePaymentUser does.
    if (payment.shopId !== shopId) {
      throw new Error(errorMSG.shopIdMismatch);
    }

    const shop = await tx.shop.findUnique({
      where: { id: shopId },
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

    // Read from BALANCE_BUCKETS rather than restating the type list, so this
    // guard cannot drift away from the lists it is protecting.
    if (!proprietor && !BALANCE_BUCKETS.monthly.types.includes(shop.type)) {
      throw new Error(errorMSG.monthlyBucketUnavailable);
    }

    // مالکانه follows ownership, monthly follows occupancy — and occupancy is
    // resolved on the payment's date, not today's renter. A payment made in
    // خرداد belongs to whoever held the unit in خرداد, even if it changed hands
    // since. This is the same function the automatic registration uses, so the
    // result matches what would have been written had the bucket been right
    // from the start.
    const reassigned = reassignPerson
      ? await resolveShopPersonAtDate(tx, shop, payment.date, proprietor)
      : null;

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        proprietor,
        ...(reassigned
          ? { personId: reassigned.personId, personName: reassigned.personName }
          : {}),
      },
    });

    if (payment.bankTransactionId) {
      await tx.bankTransaction.update({
        where: { id: payment.bankTransactionId },
        data: { category: proprietor ? "YEARLY" : "MONTHLY" },
      });
    }

    return {
      success: true,
      message: successMSG.paymentUpdated,
    };
  });
}

export default async function updatePaymentProprietorAction(
  data: UpdatePaymentProprietorProps
) {
  return handleServerAction(async (person) =>
    updatePaymentProprietor(data, person)
  );
}
