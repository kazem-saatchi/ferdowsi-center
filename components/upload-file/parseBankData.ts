import { BankTransactionData } from "./readFile";

interface BankCardTransfer {
  refrenceId: number;
  senderCard: string;
  receiverCard: string;
  amount: number;
  date: string;
}

function extract16DigitNumbers(text: string): string[] {
  // Regex pattern to match exactly 16 consecutive digits
  const regex = /\b\d{16}\b/g;
  const matches = text.match(regex);

  // Return matches or empty array if none found
  return matches || [];
}

export function parseBankData(data: BankTransactionData[]): BankCardTransfer[] {
  const bankTransfer: BankCardTransfer[] = data
    .map((row) => {
      if (row.inputAmount > 0) {
        const extractedNumber = extract16DigitNumbers(row.description);
        if (extractedNumber.length === 2) {
          return {
            refrenceId: row.transactionId,
            senderCard: extractedNumber[0],
            receiverCard: extractedNumber[1],
            amount: row.inputAmount,
            date: row.date,
          };
        }
      }
    })
    .filter((row) => row !== undefined);

  return bankTransfer;
}
