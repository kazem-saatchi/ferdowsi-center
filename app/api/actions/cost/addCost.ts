"use server";

import { db } from "@/lib/db";
import { AddCostData, addCostSchema } from "@/schema/costSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface AddCostResponse {
  costId: string;
  message: string;
}

async function addCostData(data: AddCostData, person: Person): Promise<AddCostResponse> {
    if (person.role !== "ADMIN") {
      throw new Error(errorMSG.noPermission);
    }
  
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
        category: validation.data.category,
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
  return handleServerAction<AddCostResponse>((user) => addCostData(data, user));
}
