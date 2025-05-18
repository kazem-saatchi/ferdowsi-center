"use server";

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Cost, Person } from "@prisma/client";

interface AddCostResponse {
  costsList: Cost[];
  message: string;
}

async function allCostsData(person: Person): Promise<AddCostResponse> {
  if (person.role !== "ADMIN" && person.role !== "MANAGER") {
    throw new Error(errorMSG.noPermission);
  }
  const costsList = await db.cost.findMany({ orderBy: { date: "desc" } });

  return {
    costsList,
    message: successMSG.costAdded,
  };
}

export default async function allCosts() {
  return handleServerAction<AddCostResponse>((user) => allCostsData(user));
}
