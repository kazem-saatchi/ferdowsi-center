'use server'

import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";

async function fetchTransactionData(bankTransactionId: string) {
    const transaction = await db.bankTransaction.findUnique({
        where: { id: bankTransactionId },
    });
    return transaction;
}

export async function getTransactionData(bankTransactionId: string) {
    return handleServerAction(() => fetchTransactionData(bankTransactionId));
}