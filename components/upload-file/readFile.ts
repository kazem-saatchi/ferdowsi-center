import * as XLSX from "xlsx";
import { parse, isValid } from "date-fns-jalali";
import { format } from "date-fns";
import {
  parseAmount,
  parseBalance,
  parseOptionalInt,
  parseOptionalText,
  parseReference,
} from "@/utils/bankRowParsing";

interface ExcelRow {
  [index: number]: any;
}

export interface BankTransactionData {
  date: string; // Changed from Date to string
  // time: string;
  description: string;
  /** شماره سند — a string, not a number: see utils/bankRowParsing.ts. */
  transactionId: string;
  inputAmount: number;
  outputAmount: number;
  balanceAmount: number;
  /** `Int?` in the schema, so an absent branch code is null, not branch 0. */
  branch: number | null;
}

export interface NetBankTransactionData {
  date: string; // Changed from Date to string
  description: string;
  /** شماره سند — a string, not a number: see utils/bankRowParsing.ts. */
  transactionId: string;
  bankRecieptId: string | null;
  chequeNumber: string | null;
  inputAmount: number;
  outputAmount: number;
  balanceAmount: number;
  /** `Int?` in the schema, so an absent branch code is null, not branch 0. */
  branch: number | null;
}

// Utility functions
async function readFileAsBuffer(file: File): Promise<ArrayBuffer | string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer | string);
    reader.onerror = () => reject(new Error("File reading failed"));
    file.name.endsWith(".csv")
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file);
  });
}

function jalaliToISO(jalaliDate: string): Date {
  // Additional validation
  if (!jalaliDate || typeof jalaliDate !== "string") {
    throw new Error("Date is empty or not a string");
  }

  const dateParts = jalaliDate.split("/");
  if (dateParts.length !== 3) {
    throw new Error("Invalid Jalali date format - expected yyyy/MM/dd");
  }

  const [year, month, day] = dateParts.map((part) => parseInt(part, 10));

  // Validate date components
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error("Date contains non-numeric values");
  }

  if (month < 1 || month > 12) {
    throw new Error("Invalid month (1-12)");
  }

  if (day < 1 || day > 31) {
    throw new Error("Invalid day (1-31)");
  }

  const parsedDate = parse(jalaliDate, "yyyy/MM/dd", new Date());

  if (!isValid(parsedDate)) {
    throw new Error(`Invalid Jalali date: ${jalaliDate}`);
  }

  return parsedDate;
}

// Parse Excel File General
export const parseImportFile = async (file: File): Promise<any[]> => {
  try {
    const data = await readFileAsBuffer(file);
    const workbook = XLSX.read(data, {
      type: data instanceof ArrayBuffer ? "array" : "string",
    });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  } catch (error) {
    console.error("File parsing error:", error);
    throw error;
  }
};

export const parseNetBankFile = async (
  file: File
): Promise<BankTransactionData[]> => {
  try {
    const data = await readFileAsBuffer(file);
    const workbook = XLSX.read(data, {
      type: data instanceof ArrayBuffer ? "array" : "string",
      cellDates: false, // Ensure dates are parsed correctly
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const merges = worksheet["!merges"] || [];
    const mergedRows = new Set<number>();

    merges.forEach((merge: XLSX.Range) => {
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        mergedRows.add(r);
      }
    });

    const excelData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null, // Handle empty cells
    });

    const result: NetBankTransactionData[] = [];

    excelData.forEach((row: ExcelRow, rowIndex: number) => {
      // Skip header row and merged rows
      if (rowIndex < 3 || mergedRows.has(rowIndex)) return;

      try {
        // Convert Jalali date to ISO string
        const dateObj = jalaliToISO(row[3]);
        const isoDate = format(dateObj, "yyyy-MM-dd"); // Format as string


        result.push({
          branch: parseOptionalInt(row[1]),
          date: isoDate, // Now a string
          transactionId: parseReference(row[5]),
          bankRecieptId: parseOptionalText(row[6]),
          chequeNumber: parseOptionalText(row[7]),
          // Left as-is on purpose: description is hashed exactly as stored, so
          // normalising it here would stop matching every row already imported.
          description: String(row[8] || ""),
          outputAmount: parseAmount(row[9]),
          inputAmount: parseAmount(row[10]),
          balanceAmount: parseBalance(row[11]),
        });
      } catch (error) {
        console.warn(`Skipping row ${rowIndex} due to error:`, error);
      }
    });

    return result;
  } catch (error) {
    console.error("Bank file processing error:", error);
    return [];
  }
};

// Pare Bank Excel File
export const parseBankFile = async (
  file: File
): Promise<BankTransactionData[]> => {
  try {
    const data = await readFileAsBuffer(file);
    const workbook = XLSX.read(data, {
      type: data instanceof ArrayBuffer ? "array" : "string",
      cellDates: false, // Ensure dates are parsed correctly
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const merges = worksheet["!merges"] || [];
    const mergedRows = new Set<number>();

    merges.forEach((merge: XLSX.Range) => {
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        mergedRows.add(r);
      }
    });

    const excelData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null, // Handle empty cells
    });

    const result: BankTransactionData[] = [];

    excelData.forEach((row: ExcelRow, rowIndex: number) => {
      // Skip header row and merged rows
      if (rowIndex === 0 || mergedRows.has(rowIndex)) return;

      try {
        // Skip rows with missing required fields
        if (!row[1] || !row[4]) return;

        // Convert Jalali date to ISO string
        const dateObj = jalaliToISO(row[1]);
        const isoDate = format(dateObj, "yyyy-MM-dd"); // Format as string

        result.push({
          date: isoDate, // Now a string
          // time: String(row[2] || ""),
          // Left as-is on purpose: see the note in parseNetBankFile.
          description: String(row[3] || ""),
          transactionId: parseReference(row[4]),
          inputAmount: parseAmount(row[5]),
          outputAmount: parseAmount(row[6]),
          balanceAmount: parseBalance(row[7]),
          branch: parseOptionalInt(row[8]),
        });
      } catch (error) {
        console.warn(`Skipping row ${rowIndex} due to error:`, error);
      }
    });

    return result;
  } catch (error) {
    console.error("Bank file processing error:", error);
    return [];
  }
};
