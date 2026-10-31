"use server";

import { db } from "@/lib/db";
import { AddCostData, addCostSchema } from "@/schema/cost-IncomeSchema";
import { adminWriteAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { CostCategory, Person } from "@prisma/client";

interface AddCostResponse {
  costId: string;
  message: string;
}

async function addCostData(
  data: AddCostData,
  person: Person
): Promise<AddCostResponse> {
  const validation = addCostSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const newCost = await db.cost.create({
    data: {
      title: validation.data.title,
      amount: validation.data.amount,
      date: validation.data.date,
      description: validation.data.description,
      category: validation.data.category as CostCategory,
      billImage: validation.data.billImage,
      proprietor: validation.data.proprietor,
    },
  });

  return {
    costId: newCost.id,
    message: successMSG.costAdded,
  };
}

export default async function addCost(data: AddCostData) {
  return adminWriteAction<AddCostResponse>((user) => addCostData(data, user));
}
