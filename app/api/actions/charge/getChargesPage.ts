"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import {
  LedgerListOptions,
  LedgerPage,
  ledgerDateCondition,
  ledgerSearchConditions,
  sanitizePaging,
} from "@/utils/ledgerListQuery";
import { Charge, Person, Prisma } from "@prisma/client";

/** One page of the all-charges list, newest month first and by plaque within
 *  a month, with the total of every matching charge. */
async function fetchChargesPage(
  options: LedgerListOptions,
  user: Person
): Promise<LedgerPage<Charge>> {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const { page, limit, skip } = sanitizePaging(options.page, options.limit);

  const where: Prisma.ChargeWhereInput = {
    AND: ledgerSearchConditions(options.search),
    date: ledgerDateCondition(options.from, options.to),
  };

  const [rows, totalCount, sum] = await db.$transaction([
    db.charge.findMany({
      where,
      orderBy: [{ date: "desc" }, { plaque: "asc" }, { id: "asc" }],
      skip,
      take: limit,
    }),
    db.charge.count({ where }),
    db.charge.aggregate({ where, _sum: { amount: true } }),
  ]);

  return {
    rows,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    currentPage: page,
    totalAmount: sum._sum.amount ?? 0,
  };
}

export default async function getChargesPage(options: LedgerListOptions) {
  return handleServerAction<LedgerPage<Charge>>((user) =>
    fetchChargesPage(options, user)
  );
}
