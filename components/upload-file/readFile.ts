import * as XLSX from "xlsx";
import { parse, isValid } from "date-fns-jalali";
import { format } from "date-fns";

interface ExcelRow {
  [index: number]: any;
}

interface BankTransaction {
  date: string; // Changed from Date to string
  // time: string;
  description: string;
  transactionId: number;
  inputAmount: number;
  outputAmount: number;
  balanceAmount: number;
  branch: number;
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

function parseNumber(value: unknown): number {
  if (typeof value === "string") {
    const cleanedValue = value.replace(/,/g, "").trim();
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? 0 : num;
  }
  return Number(value) || 0;
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

// Pare Bank Excel File
export const parseBankFile = async (file: File): Promise<BankTransaction[]> => {
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

    const result: BankTransaction[] = [];

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
          description: String(row[3] || ""),
          transactionId: parseNumber(row[4]),
          inputAmount: parseNumber(row[5]),
          outputAmount: parseNumber(row[6]),
          balanceAmount: parseNumber(row[7]),
          branch: parseNumber(row[8]),
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
