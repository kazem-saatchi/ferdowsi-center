"use server";

import { NetBankTransactionData } from "@/components/upload-file/readFile";
import { db } from "@/lib/db";
import { handleServerAction } from "@/utils/handleServerAction";
import { errorMSG } from "@/utils/messages";
import { AccountType, Person, Prisma, TransactionType } from "@prisma/client";
import { bankRowHash } from "@/utils/bankRowHash";

export interface ImportFailure {
  /** Enough of the row to find it in the statement. */
  reference: string;
  reason: string;
}

export interface AddBankDataResponse {
  message: string;
  /** Rows written. Kept under the original name so the other importers, which
   *  share useChunkedUpload, are unaffected. */
  addedShops: number;
  /** Rows that genuinely could not be written. Was previously inflated by
   *  duplicates, which made a partial import indistinguishable from a clean
   *  one — that is how the INT4 overflow stayed invisible for weeks. */
  failedShops: number;
  /** Rows already present. A statement is fetched by date range, so overlapping
   *  ranges are normal and skipping is the expected, healthy outcome. */
  skipped: number;
  processed: number;
  failures: ImportFailure[];
}

/** Failure reasons are reported per chunk; cap what travels to the client. */
const MAX_REPORTED_FAILURES = 20;

function extract16DigitNumbers(text: string): string[] {
  // Regex pattern to match exactly 16 consecutive digits
  const regex = /\b\d{16}\b/g;
  const matches = text.match(regex);

  // Return matches or empty array if none found
  return matches || [];
}

/** Turns a driver error into something an admin can act on. */
function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // The bug this reporting exists for: a rial value above 2^31-1 cannot fit
  // Postgres INT4, so the row was dropped silently.
  if (/into an INT4|out of range for type integer/i.test(message)) {
    return "مبلغ یا مانده بزرگ‌تر از حد مجاز ستون عددی است (سرریز عددی).";
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `${error.code}: ${message.split("\n").filter((l) => l.trim()).slice(-1)[0] ?? message}`;
  }
  return message.split("\n").filter((l) => l.trim()).slice(-1)[0] ?? message;
}

function toCreateInput(
  row: NetBankTransactionData,
  accountType: AccountType,
  bankAccountNumber: string
): Prisma.BankTransactionCreateManyInput {
  let amountValue = 0;
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
  const extractedNumber = extract16DigitNumbers(row.description);
  if (extractedNumber.length === 2) {
    senderCard = extractedNumber[0];
    receiverCard = extractedNumber[1];
  }

  const bankReferenceId = row.transactionId.toString();

  return {
    date: new Date(row.date).toISOString(),
    description: row.description,
    bankReferenceId,
    balance: row.balanceAmount,
    amount: amountValue,
    type: typeState,
    registered: false,
    recieverAccount: receiverCard,
    senderAccount: senderCard,
    branch: row.branch,
    bankAccountNumber,
    accountType,
    bankRecieptId: row.bankRecieptId,
    chequeNumber: row.chequeNumber,
    // Identity: the unique index on this column is what makes re-importing an
    // overlapping date range idempotent.
    rowHash: bankRowHash({
      accountType,
      bankAccountNumber,
      bankReferenceId,
      amount: amountValue,
      balance: row.balanceAmount,
      date: row.date,
      description: row.description,
    }),
  };
}

async function addBankDataInternal(
  accountType: AccountType,
  bankAccountNumber: string,
  data: NetBankTransactionData[],
  person: Person
): Promise<Omit<AddBankDataResponse, "message">> {
  if (person.role !== "ADMIN") {
    throw new Error(errorMSG.noPermission);
  }

  if (bankAccountNumber === "") {
    throw new Error("شماره حساب بانک الزامی هست");
  }

  const rows = data.map((row) => toCreateInput(row, accountType, bankAccountNumber));
  const processed = data.length;
  const failures: ImportFailure[] = [];

  // Fast path: one round trip for the whole chunk. skipDuplicates lets the
  // unique index absorb rows we already hold, so `count` is exactly the number
  // of genuinely new rows and the remainder were duplicates.
  try {
    const { count } = await db.bankTransaction.createMany({
      data: rows,
      skipDuplicates: true,
    });

    return {
      addedShops: count,
      skipped: processed - count,
      failedShops: 0,
      processed,
      failures,
    };
  } catch {
    // createMany is all-or-nothing, so a single bad row fails the batch. Fall
    // back to per-row inserts to isolate exactly which rows are bad and why,
    // instead of losing the whole chunk.
  }

  let added = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      await db.bankTransaction.create({ data: row });
      added++;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        skipped++; // already imported — expected on an overlapping date range
        continue;
      }
      if (failures.length < MAX_REPORTED_FAILURES) {
        failures.push({
          reference: `${data[i].date} / ${data[i].bankRecieptId || row.bankReferenceId} / ${row.amount}`,
          reason: describeError(error),
        });
      }
      console.error("[NetBankImport] row failed:", row.bankReferenceId, error);
    }
  }

  return {
    addedShops: added,
    skipped,
    failedShops: processed - added - skipped,
    processed,
    failures,
  };
}

export default async function addNetBankDataFromFile(
  accountType: AccountType,
  bankAccountNumber: string,
  data: NetBankTransactionData[]
) {
  // Wrap with handleServerAction, which adds success/data structure
  return handleServerAction(async (user) => {
    const result = await addBankDataInternal(
      accountType,
      bankAccountNumber,
      data,
      user
    );

    const parts = [`${result.addedShops} ثبت شد`];
    if (result.skipped) parts.push(`${result.skipped} تکراری`);
    if (result.failedShops) parts.push(`${result.failedShops} ناموفق`);

    return {
      ...result,
      message: `${parts.join("، ")} از ${result.processed} ردیف.`,
    };
  });
}
