import { exportShopsBalanceToExcel } from "./shopsBalanceExcel";
import { exportToPDF } from "./tableExport";
import {
  RENT_PDF_COLUMNS,
  rentBalancePdfRows,
  type RentBalanceData,
} from "./rentBalance";

const FILE_NAME = "Rents-Balance-Report";

/** The rent list as a landscape PDF: ten columns do not fit A4 portrait. */
export function exportRentsBalanceToPDF(rows: RentBalanceData[]) {
  if (rows.length === 0) return;
  exportToPDF({
    fileName: FILE_NAME,
    columns: [...RENT_PDF_COLUMNS],
    data: rentBalancePdfRows(rows),
    orientation: "landscape",
    // Keep "پارکینگ" on one line; autotable squeezes short columns otherwise.
    columnStyles: { 1: { minCellWidth: 18 } },
  });
}

/** The rent list through the shared all-shops Excel report ("rent" layout). */
export async function exportRentsBalanceToExcel(
  rows: RentBalanceData[],
  lastBankTransactionDate?: Date | null
) {
  if (rows.length === 0) return;
  await exportShopsBalanceToExcel({
    shops: rows,
    variant: "rent",
    lastBankTransactionDate,
    fileName: FILE_NAME,
  });
}
