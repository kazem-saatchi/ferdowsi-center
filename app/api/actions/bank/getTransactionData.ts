'use server'

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { Person } from "@prisma/client";

async function fetchTransactionData(bankTransactionId: string, user: Person) {
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
        throw new Error(errorMSG.unauthorized);
    }

    const transaction = await db.bankTransaction.findUnique({
        where: { id: bankTransactionId },
    });
    return transaction;
}

export async function getTransactionData(bankTransactionId: string) {
    return handleServerAction((user) =>
        fetchTransactionData(bankTransactionId, user)
    );
}