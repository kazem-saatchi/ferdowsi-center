'use server'

import { db } from "@/lib/db";
import { adminReadAction } from "@/utils/handleServerAction";
import { Person } from "@prisma/client";

async function fetchTransactionData(bankTransactionId: string, user: Person) {
    const transaction = await db.bankTransaction.findUnique({
        where: { id: bankTransactionId },
    });
    return transaction;
}

export async function getTransactionData(bankTransactionId: string) {
    return adminReadAction((user) =>
        fetchTransactionData(bankTransactionId, user)
    );
}