"use server";

import { db } from "@/lib/db";
import { TransactionType, TransactionCategory } from "@prisma/client";

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

export async function getBankTransactionsForReport(
  startDate: Date,
  endDate: Date
): Promise<BankTransactionData[]> {
  const transactions = await db.bankTransaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
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

  return transactions;
}

