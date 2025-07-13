// app/actions/getBankTransactions.ts
"use server";

import { db } from "@/lib/db";
import { BankTransaction, Prisma } from "@prisma/client";

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
  data: BankTransaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getBankIncomeTransfer(
  options: GetTransactionsOptions = {}
): Promise<GetTransactionsResult> {
  const {
    page = 1,
    limit = 100, // Default limit
    sortBy = "date", // Default sort field
    sortOrder = "desc", // Default sort order
  } = options;

  // Add validation
  if (isNaN(page) || page < 1) throw new Error("Invalid page number");

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
      data: transactions, // or serializableTransactions
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch bank transactions:", error);
    // It's often better to throw the error and let TanStack Query handle it
    throw new Error("Failed to fetch bank transactions.");
    // Or return a structured error:
    // return { data: [], totalCount: 0, totalPages: 0, currentPage: 1, error: 'Failed to fetch data' };
  }
}
