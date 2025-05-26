"use server";

import { db } from "@/lib/db";
import {
  AddCostFromBankData,
  addCostFromBankSchema,
} from "@/schema/cost-IncomeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { CostCategory, Person } from "@prisma/client";

interface AddCostResponse {
  costId: string;
  message: string;
}

async function addCostData(
  data: AddCostFromBankData,
  person: Person
): Promise<AddCostResponse> {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  const validation = addCostFromBankSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(
      validation.error.errors.map((err) => err.message).join(", ")
    );
  }

  const checkCost = await db.cost.findFirst({
    where: { bankTransactionId: validation.data.bankTransactionId },
  });

  if (checkCost) {
    throw new Error(errorMSG.txAlreadyExist);
  }

  const { newCost, updatedBankTx } = await db.$transaction(async (prisma) => {
    const newCost = await prisma.cost.create({
      data: {
        title: validation.data.title,
        amount: validation.data.amount,
        date: validation.data.date,
        description: validation.data.description,
        category: validation.data.category as CostCategory,
        billImage: validation.data.billImage,
        proprietor: validation.data.proprietor,
        bankTransactionId: validation.data.bankTransactionId,
      },
    });

    const updatedBankTx = await prisma.bankTransaction.update({
      where: { id: validation.data.bankTransactionId },
      data: {
        registered: true,
        referenceId: newCost.id,
        referenceType: "COST",
        category: validation.data.proprietor ? "YEARLY" : "MONTHLY",
      },
    });

    return { newCost, updatedBankTx };
  });

  return {
    costId: newCost.id,
    message: successMSG.costAdded,
  };
}

export default async function addCostFromBank(data: AddCostFromBankData) {
  return handleServerAction<AddCostResponse>((user) => addCostData(data, user));
}
