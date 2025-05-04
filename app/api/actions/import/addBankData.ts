"use server";

import { BankTransactionData } from "@/components/upload-file/readFile";
import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG, successMSG } from "@/utils/messages";
import { TransactionType } from "@prisma/client";

export interface AddBankDataResponse {
  message: string;
  addedShops: number;
  failedShops: number;
  processed: number;
}

function extract16DigitNumbers(text: string): string[] {
  // Regex pattern to match exactly 16 consecutive digits
  const regex = /\b\d{16}\b/g;
  const matches = text.match(regex);

  // Return matches or empty array if none found
  return matches || [];
}

async function addBankDataInternal(
  data: BankTransactionData[],
  admin: { role: string }
): Promise<Omit<AddBankDataResponse, "message">> {
  if (admin.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  let addedShops = 0;
  let failedShops = 0;
  const processedCount = data.length; // Track the size of the input chunk

  for (const row of data) {
    await db.$transaction(
      async (prisma) => {
        try {
          let amountValue: number = 0;
          let typeState: TransactionType = "UNKNOWN";
          if (row.inputAmount > 0) {
            amountValue = row.inputAmount;
            typeState = "INCOME";
          } else if (row.outputAmount > 0) {
            amountValue = row.outputAmount;
            typeState = "PAYMENT";
          }

          let senderCard: string | null = null;
          let receiverCard: string | null = null;

          if (row.inputAmount > 0) {
            const extractedNumber = extract16DigitNumbers(row.description);
            if (extractedNumber.length === 2) {
              senderCard = extractedNumber[0];
              receiverCard = extractedNumber[1];
            }
          }

          const bankRow = await prisma.bankTransaction.findFirst({
            where: {
              bankReferenceId: row.transactionId.toString(),
              amount: amountValue,
              balance: row.balanceAmount,
            },
          });

          if (bankRow) {
            failedShops++;
            console.error("Failed to add row:", row.transactionId);
            return; // Skip to next row
          }

          await prisma.bankTransaction.create({
            data: {
              createdAt: new Date(row.date).toISOString(),
              description: row.description,
              bankReferenceId: row.transactionId.toString(),
              balance: row.balanceAmount,
              amount: amountValue,
              type: typeState,
              registered: false,
              recieverAccount: receiverCard && receiverCard,
              senderAccount: senderCard && senderCard,
              branch: row.branch,
            },
          });

          addedShops++;
        } catch (error) {
          failedShops++;
          console.error("Failed to add row:", row.transactionId, error);
        }
      },
      { timeout: 60_000 } // Increases timeout to 60 seconds
    );
  }

  return {
    addedShops,
    failedShops,
    processed: processedCount,
  };
}

export default async function addBankDataFromFile(data: BankTransactionData[]) {
  // Wrap with handleServerAction, which adds success/data structure
  return handleServerAction(async (user) => {
    const result = await addBankDataInternal(data, user); // Call the internal logic
    // Construct the final message based on chunk results
    const message = `Chunk processed: ${result.addedShops} added, ${result.failedShops} failed out of ${result.processed}.`;
    return { ...result, message };
  });
}
