"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { bankAmountToNumber } from "@/utils/bankAmount";
import { Person, TransactionType, TransactionCategory } from "@prisma/client";

export interface BankTransactionData {
  id: string;
  recieverAccount?: string | null;
  senderAccount?: string | null;
  amount: number;
  balance: number;
  type: TransactionType;
  category?: TransactionCategory | null;
  description: string;
  date: Date;
  bankAccountNumber: string;
  accountType: string;
  bankReferenceId: string;
  bankRecieptId?: string | null;
  chequeNumber?: string | null;
  branch?: number | null;
}

async function fetchBankTransactionsForReport(
  startDate: Date,
  endDate: Date,
  user: Person
): Promise<BankTransactionData[]> {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error(errorMSG.unauthorized);
  }

  const transactions = await db.bankTransaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      // A row an admin removed from /card-transfer carries registerAble =
      // false: a duplicate import or an artifact that is not real account
      // activity. This query filtered on date alone, so those rows still
      // reached bankReportCalculations and inflated totalIncome even after
      // being hidden from every other list.
      registerAble: true,
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      recieverAccount: true,
      senderAccount: true,
      amount: true,
      balance: true,
      type: true,
      category: true,
      description: true,
      date: true,
      bankAccountNumber: true,
      accountType: true,
      bankReferenceId: true,
      bankRecieptId: true,
      chequeNumber: true,
      branch: true,
    },
  });

  // amount/balance are BigInt in the database; this payload is declared in
  // numbers and has to cross a server-action boundary, which cannot encode
  // bigint. See utils/bankAmount.ts.
  return transactions.map((t) => ({
    ...t,
    amount: bankAmountToNumber(t.amount),
    balance: bankAmountToNumber(t.balance),
  }));
}

export async function getBankTransactionsForReport(
  startDate: Date,
  endDate: Date
) {
  return handleServerAction<BankTransactionData[]>((user) =>
    fetchBankTransactionsForReport(startDate, endDate, user)
  );
}

