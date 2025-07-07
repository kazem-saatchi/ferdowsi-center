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

export async function getBankFailedCardTransfer(
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

  console.log("Server received:", {
    page: options.page,
    limit: options.limit,
    skip, // Should increment by limit per page
  });

  try {
    const [transactions, totalCount] = await db.$transaction([
      db.bankTransaction.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        where: {
          recieverAccount: { not: null },
          senderAccount: { not: null },
          registered: false,
          registerAble: true,
          type: "PAYMENT",
        },
      }),
      db.bankTransaction.count({
        where: {
          recieverAccount: { not: null },
          senderAccount: { not: null },
          registered: false,
          registerAble: true,
          type: "UNKNOWN",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // You might want to serialize Date objects if necessary,
    // though Next.js often handles this automatically for Server Actions.
    // If you encounter issues, map over transactions and convert dates to strings:
    // const serializableTransactions = transactions.map(tx => ({
    //   ...tx,
    //   date: tx.date.toISOString(),
    //   createdAt: tx.createdAt.toISOString(),
    // }));

    return {
      data: transactions, // or serializableTransactions
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch bank failed card transfer:", error);
    // It's often better to throw the error and let TanStack Query handle it
    throw new Error("Failed to fetch bank failed card transfer.");
    // Or return a structured error:
    // return { data: [], totalCount: 0, totalPages: 0, currentPage: 1, error: 'Failed to fetch data' };
  }
}
