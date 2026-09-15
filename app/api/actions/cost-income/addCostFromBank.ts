"use server";

import { db } from "@/lib/db";
import {
  AddCostFromBankData,
  addCostFromBankSchema,
} from "@/schema/cost-IncomeSchema";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { CostCategory, Person } from "@prisma/client";
import { claimBankTransaction } from "@/utils/bankRegistration";

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

  // Fast, friendly pre-check only. The authoritative check is the conditional
  // claim inside the transaction below — this read cannot be trusted, because
  // another request can register the row between here and the write.
  const checkCost = await db.cost.findFirst({
    where: { bankTransactionId: validation.data.bankTransactionId },
  });

  if (checkCost) {
    throw new Error(errorMSG.txAlreadyExist);
  }

  const newCost = await db.$transaction(async (prisma) => {
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

    // Claim after creating, inside the same transaction: a losing claim throws
    // and rolls the cost back, so one bank row can never become two costs — or
    // a cost on top of a payment.
    await claimBankTransaction(prisma, {
      bankTransactionId: validation.data.bankTransactionId,
      referenceId: newCost.id,
      referenceType: "COST",
      category: validation.data.proprietor ? "YEARLY" : "MONTHLY",
    });

    return newCost;
  });

  return {
    costId: newCost.id,
    message: successMSG.costAdded,
  };
}

export default async function addCostFromBank(data: AddCostFromBankData) {
  return handleServerAction<AddCostResponse>((user) => addCostData(data, user));
}
