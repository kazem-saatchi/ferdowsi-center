"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import {
  LedgerPage,
  PaymentListOptions,
  ledgerDateCondition,
  ledgerSearchConditions,
  sanitizePaging,
} from "@/utils/ledgerListQuery";
import { Payment, PaymentType, Person, Prisma } from "@prisma/client";

/** One page of the all-payments list, newest first, with the total of every
 *  matching payment. Only the page travels to the browser, so the list stays
 *  quick as payments pile up month after month. */
async function fetchPaymentsPage(
  options: PaymentListOptions,
  user: Person
): Promise<LedgerPage<Payment>> {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const { page, limit, skip } = sanitizePaging(options.page, options.limit);
  const type =
    options.type && Object.values(PaymentType).includes(options.type)
      ? options.type
      : undefined;

  const where: Prisma.PaymentWhereInput = {
    AND: ledgerSearchConditions(options.search),
    date: ledgerDateCondition(options.from, options.to),
    type,
  };

  const [rows, totalCount, sum] = await db.$transaction([
    db.payment.findMany({
      where,
      orderBy: [{ date: "desc" }, { plaque: "asc" }, { id: "asc" }],
      skip,
      take: limit,
    }),
    db.payment.count({ where }),
    db.payment.aggregate({ where, _sum: { amount: true } }),
  ]);

  return {
    rows,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    currentPage: page,
    totalAmount: sum._sum.amount ?? 0,
  };
}

export default async function getPaymentsPage(options: PaymentListOptions) {
  return handleServerAction<LedgerPage<Payment>>((user) =>
    fetchPaymentsPage(options, user)
  );
}
