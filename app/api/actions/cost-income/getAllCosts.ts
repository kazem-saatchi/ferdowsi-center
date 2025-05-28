"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Cost, CostCategory, Person, Prisma } from "@prisma/client";

type CostFilters = {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  category?: CostCategory;
  proprietor?: boolean;
};

type SortOptions = {
  field: keyof Prisma.CostOrderByWithRelationInput;
  order: "asc" | "desc";
};

interface AddCostResponse {
  costsList: Cost[];
  message: string;
}

async function allCostsData(
  person: Person,
  filters?: CostFilters,
  sort?: SortOptions
): Promise<AddCostResponse> {
  if (person.role !== "ADMIN" && person.role !== "MANAGER") {
    throw new Error(errorMSG.noPermission);
  }

  // Build where clause
  const where: Prisma.CostWhereInput = {};

  if (filters) {
    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    // Amount range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {
        gte: filters.minAmount,
        lte: filters.maxAmount,
      };
    }

    // Other filters
    if (filters.category) where.category = filters.category;
    if (filters.proprietor !== undefined) where.proprietor = filters.proprietor;
  }

  // Default sorting (by date descending if none provided)
  const orderBy: Prisma.CostOrderByWithRelationInput = sort
    ? { [sort.field]: sort.order }
    : { date: "desc" };

  const costsList = await db.cost.findMany({
    where,
    orderBy,
  });

  return {
    costsList,
    message: successMSG.costAdded,
  };
}

export default async function getAllCosts() {
  return handleServerAction<AddCostResponse>((user) => allCostsData(user));
}
