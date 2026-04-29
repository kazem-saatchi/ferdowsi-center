'use server'

import { db } from "@/lib/db";

export async function getTransactionData(bankTransactionId: string) {
    const transaction = await db.bankTransaction.findUnique({
        where: {
            id: bankTransactionId,
        },
    });
    return transaction;
}