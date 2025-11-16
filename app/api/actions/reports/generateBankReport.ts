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

export interface BankReportCategoryData {
  category: TransactionCategory | "UNCATEGORIZED";
  incomeTransactions: BankTransactionData[];
  paymentTransactions: BankTransactionData[];
  totalIncome: number;
  totalPayments: number;
  netAmount: number;
  transactionCount: number;
}

export interface BankReportResponse {
  totalIncome: number;
  totalPayments: number;
  netBalance: number;
  totalTransactions: number;
  categories: BankReportCategoryData[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export async function generateBankReport(
  startDate?: Date,
  endDate?: Date
): Promise<BankReportResponse> {
  // Build where clause for date filtering
  const whereClause: any = {};
  if (startDate && endDate) {
    whereClause.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  // Fetch all bank transactions with optional date filter
  const transactions = await db.bankTransaction.findMany({
    where: whereClause,
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

  // Group transactions by category
  const categoryMap = new Map<string, BankReportCategoryData>();

  transactions.forEach((transaction) => {
    const categoryKey = transaction.category || "UNCATEGORIZED";

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        category: categoryKey as TransactionCategory | "UNCATEGORIZED",
        incomeTransactions: [],
        paymentTransactions: [],
        totalIncome: 0,
        totalPayments: 0,
        netAmount: 0,
        transactionCount: 0,
      });
    }

    const categoryData = categoryMap.get(categoryKey)!;

    if (transaction.type === "INCOME") {
      categoryData.incomeTransactions.push(transaction);
      categoryData.totalIncome += transaction.amount;
    } else if (transaction.type === "PAYMENT") {
      categoryData.paymentTransactions.push(transaction);
      categoryData.totalPayments += transaction.amount;
    }

    categoryData.transactionCount += 1;
    categoryData.netAmount =
      categoryData.totalIncome - categoryData.totalPayments;
  });

  // Convert map to array and sort by net amount (descending)
  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => b.netAmount - a.netAmount
  );

  // Calculate totals
  const totalIncome = categories.reduce((sum, cat) => sum + cat.totalIncome, 0);
  const totalPayments = categories.reduce(
    (sum, cat) => sum + cat.totalPayments,
    0
  );
  const netBalance = totalIncome - totalPayments;
  const totalTransactions = transactions.length;

  return {
    totalIncome,
    totalPayments,
    netBalance,
    totalTransactions,
    categories,
    dateRange:
      startDate && endDate ? { start: startDate, end: endDate } : undefined,
  };
}
