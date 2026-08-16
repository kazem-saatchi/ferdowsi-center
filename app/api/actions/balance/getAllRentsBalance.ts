"use server";

import { ShopsBalanceData } from "@/schema/balanceSchema";
import { calculateAllRentsBalance } from "@/utils/calculateBalance";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";
import { db } from "@/lib/db";

interface FindBalanceResponse {
  success: boolean;
  message: string;
  shopsBalance?: ShopsBalanceData[];
  /** Newest bank statement row in the database. Reports print it so the reader
   *  knows payments made after that date are not reflected yet. */
  lastBankTransactionDate?: Date;
}

async function getAllRentsBalance(user: Person): Promise<FindBalanceResponse> {
  if (!user) {
    throw new Error(errorMSG.unauthorized);
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const shopsBalance: ShopsBalanceData[] = await calculateAllRentsBalance();

  const lastBankTransaction = await db.bankTransaction.aggregate({
    _max: { date: true },
  });

  return {
    success: true,
    message: successMSG.balancesFound,
    shopsBalance,
    lastBankTransactionDate: lastBankTransaction._max.date ?? undefined,
  };
}

export default async function findRentBalanceAllShops() {
  return handleServerAction<FindBalanceResponse>((user) =>
    getAllRentsBalance(user)
  );
}
