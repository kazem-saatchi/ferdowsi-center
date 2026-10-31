"use server";

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Income, Person } from "@prisma/client";

interface AddIncomeResponse {
  incomesList: Income[];
  message: string;
}

async function allIncomesData(person: Person): Promise<AddIncomeResponse> {
  const incomesList = await db.income.findMany({ orderBy: { date: "desc" } });

  return {
    incomesList,
    message: successMSG.incomeAdded,
  };
}

export default async function allIncomes() {
  return adminReadAction<AddIncomeResponse>((user) => allIncomesData(user));
}
