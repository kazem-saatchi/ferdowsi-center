"use server";

import { db } from "@/lib/db";
import { AddIncomeData, addIncomeSchema } from "@/schema/cost-IncomeSchema";
import { adminWriteAction } from "@/utils/handleServerAction";
import { successMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

interface AddIncomeResponse {
  incomeId: string;
  message: string;
}

async function addIncomeData(data: AddIncomeData, person: Person): Promise<AddIncomeResponse> {
    const validation = addIncomeSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(
        validation.error.errors.map((err) => err.message).join(", ")
      );
    }
  
    const newIncome = await db.income.create({
      data: {
        title: validation.data.title,
        amount: validation.data.amount,
        date: validation.data.date,
        description: validation.data.description,
        billImage: validation.data.billImage,
        proprietor: validation.data.proprietor,
        name:validation.data.name
      },
    });
  
    return {
      incomeId: newIncome.id,
      message: successMSG.incomeAdded,
    };
  }
  

export default async function addIncome(data: AddIncomeData) {
  return adminWriteAction<AddIncomeResponse>((user) => addIncomeData(data, user));
}
