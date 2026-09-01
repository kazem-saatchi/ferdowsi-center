// app/actions/getBankTransactions.ts
"use server";

import { db } from "@/lib/db";
import {
  serializeBankTransaction,
  SerializedBankTransaction,
} from "@/utils/bankAmount";
import {
  buildBankTransactionWhere,
  BankTransactionFilters,
  BankTransactionSortField,
} from "@/utils/bankTransactionFilters";

// Pagination and sorting on top of the shared filter set. Every filter is
// optional, so existing callers that pass only page/limit keep working.
export interface GetTransactionsOptions extends BankTransactionFilters {
  page?: number;
  limit?: number;
  sortBy?: BankTransactionSortField;
  sortOrder?: "asc" | "desc";
}

// Define the return type for better type checking
interface GetTransactionsResult {
  data: SerializedBankTransaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getBankTransactions(
  options: GetTransactionsOptions = {}
): Promise<GetTransactionsResult> {
  const {
    page = 1,
    limit = 10, // Default limit
    sortBy = "date", // Default sort field
    sortOrder = "desc", // Default sort order
    ...filters
  } = options;

  const skip = (page - 1) * limit;

  // One clause for both queries — the rows and the count that pages them can
  // never disagree about what "matching" means.
  const where = buildBankTransactionWhere(filters);

  try {
    const [transactions, totalCount] = await db.$transaction([
      db.bankTransaction.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        where,
      }),
      db.bankTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      // amount/balance are BigInt in the database and cannot cross a server
      // action boundary. See utils/bankAmount.ts.
      data: transactions.map(serializeBankTransaction),
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch bank transactions:", error);
    // It's often better to throw the error and let TanStack Query handle it
    throw new Error("Failed to fetch bank transactions.");
  }
}
