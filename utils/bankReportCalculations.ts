import { TransactionCategory } from "@prisma/client";
import { BankTransactionData } from "@/app/api/actions/reports/getBankTransactionsForReport";
import { incomeCategories, paymentCategories } from "./bankCategories";

export interface BankReportCategoryData {
  category: TransactionCategory | "UNCATEGORIZED";
  type: "INCOME" | "PAYMENT";
  transactions: BankTransactionData[];
  totalAmount: number;
  transactionCount: number;
}

export interface BankReportSummary {
  totalIncome: number;
  totalPayments: number;
  netBalance: number;
  totalTransactions: number;
  categories: BankReportCategoryData[];
}

/**
 * Initialize all categories with zero values
 */
export function initializeCategories(): Map<string, BankReportCategoryData> {
  const categoryMap = new Map<string, BankReportCategoryData>();

  // Initialize income categories
  incomeCategories.forEach((cat) => {
    categoryMap.set(cat, {
      category: cat,
      type: "INCOME",
      transactions: [],
      totalAmount: 0,
      transactionCount: 0,
    });
  });

  // Initialize payment categories
  paymentCategories.forEach((cat) => {
    categoryMap.set(cat, {
      category: cat,
      type: "PAYMENT",
      transactions: [],
      totalAmount: 0,
      transactionCount: 0,
    });
  });

  return categoryMap;
}

/**
 * Group transactions by category and type
 */
export function groupTransactionsByCategory(
  transactions: BankTransactionData[]
): BankReportCategoryData[] {
  const categoryMap = initializeCategories();

  // Initialize uncategorized buckets
  const uncategorizedIncome: BankReportCategoryData = {
    category: "UNCATEGORIZED",
    type: "INCOME",
    transactions: [],
    totalAmount: 0,
    transactionCount: 0,
  };

  const uncategorizedPayment: BankReportCategoryData = {
    category: "UNCATEGORIZED",
    type: "PAYMENT",
    transactions: [],
    totalAmount: 0,
    transactionCount: 0,
  };

  // Process each transaction
  transactions.forEach((transaction) => {
    if (!transaction.category) {
      // Handle uncategorized - split by transaction type
      if (transaction.type === "INCOME") {
        uncategorizedIncome.transactions.push(transaction);
        uncategorizedIncome.totalAmount += transaction.amount;
        uncategorizedIncome.transactionCount += 1;
      } else if (transaction.type === "PAYMENT") {
        uncategorizedPayment.transactions.push(transaction);
        uncategorizedPayment.totalAmount += transaction.amount;
        uncategorizedPayment.transactionCount += 1;
      }
    } else {
      const categoryData = categoryMap.get(transaction.category);
      if (categoryData) {
        categoryData.transactions.push(transaction);
        categoryData.totalAmount += transaction.amount;
        categoryData.transactionCount += 1;
      }
    }
  });

  // Convert map to array and add uncategorized if they have transactions
  let categories = Array.from(categoryMap.values());

  if (uncategorizedIncome.transactionCount > 0) {
    categories.push(uncategorizedIncome);
  }

  if (uncategorizedPayment.transactionCount > 0) {
    categories.push(uncategorizedPayment);
  }

  // Sort: income categories first (by amount desc), then payment categories (by amount desc)
  categories.sort((a, b) => {
    if (a.type === b.type) {
      return b.totalAmount - a.totalAmount;
    }
    return a.type === "INCOME" ? -1 : 1;
  });

  return categories;
}

/**
 * Calculate report summary from grouped categories
 */
export function calculateReportSummary(
  categories: BankReportCategoryData[],
  totalTransactions: number
): BankReportSummary {
  const totalIncome = categories
    .filter((cat) => cat.type === "INCOME")
    .reduce((sum, cat) => sum + cat.totalAmount, 0);

  const totalPayments = categories
    .filter((cat) => cat.type === "PAYMENT")
    .reduce((sum, cat) => sum + cat.totalAmount, 0);

  const netBalance = totalIncome - totalPayments;

  return {
    totalIncome,
    totalPayments,
    netBalance,
    totalTransactions,
    categories,
  };
}

/**
 * Process raw transactions into a complete bank report
 */
export function processTransactionsForReport(
  transactions: BankTransactionData[]
): BankReportSummary {
  const groupedCategories = groupTransactionsByCategory(transactions);
  return calculateReportSummary(groupedCategories, transactions.length);
}

