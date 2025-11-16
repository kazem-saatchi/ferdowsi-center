"use server";

import { db } from "@/lib/db";
import { CostCategory } from "@prisma/client";

export interface CostReportData {
  category: CostCategory;
  totalAmount: number;
  costCount: number;
  costs: Array<{
    id: string;
    title: string;
    amount: number;
    date: Date;
    description: string;
    proprietor: boolean;
    name: string;
  }>;
}

export interface CostReportResponse {
  totalCosts: number;
  totalAmount: number;
  categories: CostReportData[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export async function generateCostsReport(
  startDate?: Date,
  endDate?: Date
): Promise<CostReportResponse> {
  // Build where clause for date filtering
  const whereClause: any = {};
  if (startDate && endDate) {
    whereClause.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  // Fetch all costs with optional date filter
  const costs = await db.cost.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      amount: true,
      date: true,
      description: true,
      category: true,
      proprietor: true,
      name: true,
    },
  });

  // Group costs by category
  const categoryMap = new Map<CostCategory, CostReportData>();

  costs.forEach((cost) => {
    if (!categoryMap.has(cost.category)) {
      categoryMap.set(cost.category, {
        category: cost.category,
        totalAmount: 0,
        costCount: 0,
        costs: [],
      });
    }

    const categoryData = categoryMap.get(cost.category)!;
    categoryData.totalAmount += cost.amount;
    categoryData.costCount += 1;
    categoryData.costs.push({
      id: cost.id,
      title: cost.title,
      amount: cost.amount,
      date: cost.date,
      description: cost.description,
      proprietor: cost.proprietor,
      name: cost.name,
    });
  });

  // Convert map to array and sort by total amount (descending)
  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  const totalCosts = costs.length;
  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return {
    totalCosts,
    totalAmount,
    categories,
    dateRange:
      startDate && endDate ? { start: startDate, end: endDate } : undefined,
  };
}
