// app/actions/getBankTransactions.ts
"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import {
  serializeBankTransaction,
  SerializedBankTransaction,
} from "@/utils/bankAmount";
import { BankTransaction, Person, Prisma } from "@prisma/client";

// Define options for fetching, including pagination and sorting
interface GetTransactionsOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof BankTransaction;
  sortOrder?: "asc" | "desc";
  // Add filter parameters as needed (e.g., date range, type, category)
  // filterType?: TransactionType;
  // filterCategory?: TransactionCategory;
  // startDate?: Date;
  // endDate?: Date;
}

// Define the return type for better type checking
interface GetTransactionsResult {
  data: SerializedBankTransaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

async function fetchBankIncomeTransfer(
  options: GetTransactionsOptions,
  user: Person
): Promise<GetTransactionsResult> {
  const {
    page = 1,
    limit = 100, // Default limit
    sortBy = "date", // Default sort field
    sortOrder = "desc", // Default sort order
  } = options;

  // Add validation
  if (isNaN(page) || page < 1) throw new Error("شماره صفحه نامعتبر است.");

  const skip = (page - 1) * limit;

  try {
    const [transactions, totalCount] = await db.$transaction([
      db.bankTransaction.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        where: {
          recieverAccount: null,
          senderAccount: null,
          registered: false,
          registerAble: true,
          type: "INCOME",
        },
      }),
      db.bankTransaction.count({
        where: {
          recieverAccount: null,
          senderAccount: null,
          registered: false,
          registerAble: true,
          type: "INCOME",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: transactions.map(serializeBankTransaction),
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch bank transactions:", error);
    // It's often better to throw the error and let TanStack Query handle it
    throw new Error("دریافت تراکنش‌های بانکی انجام نشد.");
    // Or return a structured error:
    // return { data: [], totalCount: 0, totalPages: 0, currentPage: 1, error: 'Failed to fetch data' };
  }
}

export async function getBankIncomeTransfer(
  options: GetTransactionsOptions = {}
) {
  return adminReadAction<GetTransactionsResult>((user) =>
    fetchBankIncomeTransfer(options, user)
  );
}
