"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Income, Person } from "@prisma/client";

interface AddIncomeResponse {
  incomesList: Income[];
  message: string;
}

async function allIncomesData(person: Person): Promise<AddIncomeResponse> {
  if (person.role !== "ADMIN" && person.role !== "MANAGER") {
    throw new Error(errorMSG.noPermission);
  }
  const incomesList = await db.income.findMany({ orderBy: { date: "desc" } });

  return {
    incomesList,
    message: successMSG.incomeAdded,
  };
}

export default async function allIncomes() {
  return handleServerAction<AddIncomeResponse>((user) => allIncomesData(user));
}
