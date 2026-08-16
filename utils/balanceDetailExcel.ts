import type { Row, Workbook, Worksheet } from "exceljs";
import type { Charge, Payment } from "@prisma/client";
import { labels } from "./label";
import { formatPersianDate } from "./localeDate";
import { calculateMonthlyShare } from "./monthlyChargeShare";
import {
  addBanner as addBannerRow,
  borderRow,
  createReportSheet,
  downloadWorkbook,
  fillRow,
  type BannerOptions,
  CURRENCY_FORMAT,
  FONT,
  GREY,
  STRONG_BORDER,
  THIN_BORDER,
} from "./excelReport";

/** Which slice of the shop ledger the sheet represents. Mirrors the tab ids in
 *  components/balance/BalanceDetaiTable.tsx. */
export type BalanceDetailVariant = "all" | "proprietor" | "non-proprietor";

export interface BalanceDetailExcelOptions {
  charges: Charge[];
  payments: Payment[];
  variant: BalanceDetailVariant;
  plaque?: string | number;
  /** Newest bank statement row in the database — printed as a warning so the
   *  reader knows later payments are not in this report yet. */
  lastBankTransactionDate?: Date | null;
  /** Current renter. When set, the monthly section prints a renter/owner split
   *  underneath its total. */
  renterId?: string | null;
  ownerName?: string;
  renterName?: string;
  fileName?: string;
}

// ── sheet geometry ──────────────────────────────────────────────────────────
// Seven columns, sized to fit the printable width of A4 portrait with narrow
// margins (~682px of the ~698px available). fitToWidth below is the safety net.
const COLUMNS = [
  { header: labels.type, width: 7 },
  { header: labels.title, width: 16, wrap: true },
  { header: labels.name, width: 13 },
  { header: labels.date, width: 10.5 },
  { header: labels.amountRials, width: 12, currency: true },
  { header: labels.balanceRials, width: 12, currency: true },
  { header: labels.transactionInfo, width: 22, wrap: true },
] as const;

const LAST_COL = COLUMNS.length; // 7 → column G

/** Excel only auto-fits wrapped rows once it renders them, which some viewers
 *  skip when printing straight from the file. Estimating the height here keeps
 *  the long bank descriptions from being clipped on paper. */
function wrappedRowHeight(title: string, description: string): number {
  // Column width is in units of the default font; the 9pt body font fits a
  // little more than one character per unit.
  const linesIn = (text: string, width: number) =>
    Math.ceil(text.length / Math.max(1, Math.floor(width * 1.15)));

  const lines = Math.max(
    1,
    linesIn(title, COLUMNS[1].width),
    linesIn(description, COLUMNS[6].width)
  );
  return Math.min(120, Math.max(18, lines * 12 + 4));
}

// ── data preparation ────────────────────────────────────────────────────────

interface LedgerRow {
  typeLabel: string;
  isCharge: boolean;
  title: string;
  personName: string;
  date: Date;
  amount: number;
  description: string;
  /** Running balance after this transaction, accumulated within its section. */
  balance: number;
}

/** Merges charges and payments into one ledger, accumulates the running balance
 *  chronologically (charges add, payments subtract), then returns the rows
 *  newest-first to match the on-screen table. */
function buildLedger(
  charges: Charge[],
  payments: Payment[]
): { rows: LedgerRow[]; total: number } {
  const merged = [
    ...charges.map((charge) => ({ item: charge, isCharge: true })),
    ...payments.map((payment) => ({ item: payment, isCharge: false })),
  ].sort(
    (a, b) => (a.item.date?.getTime() || 0) - (b.item.date?.getTime() || 0)
  );

  let running = 0;
  const rows: LedgerRow[] = merged.map(({ item, isCharge }) => {
    running += isCharge ? item.amount : -item.amount;
    return {
      typeLabel: isCharge ? labels.charge : labels.payment,
      isCharge,
      title: item.title || "",
      personName: item.personName || "",
      date: item.date,
      amount: item.amount || 0,
      description: item.description || "",
      balance: running,
    };
  });

  rows.reverse(); // newest first
  return { rows, total: running };
}

// ── sheet building ──────────────────────────────────────────────────────────

const border = (row: Row) => borderRow(row, LAST_COL);
const fill = (row: Row, argb?: string) => fillRow(row, LAST_COL, argb);
const addBanner = (sheet: Worksheet, text: string, opts: BannerOptions) =>
  addBannerRow(sheet, LAST_COL, text, opts);

function variantLabel(variant: BalanceDetailVariant): string {
  if (variant === "proprietor") return labels.proprietorChargeSection;
  if (variant === "non-proprietor") return labels.monthlyChargeSection;
  return labels.allChargesSection;
}

function addHeaderBlock(
  sheet: Worksheet,
  { variant, plaque, lastBankTransactionDate }: BalanceDetailExcelOptions
) {
  addBanner(sheet, labels.complexName, {
    height: 30,
    size: 15,
    fillColor: GREY.title,
  });

  const plaquePart = plaque != null ? ` ${plaque}` : "";
  addBanner(sheet, `${labels.balanceDetailReportTitle}${plaquePart}`, {
    height: 22,
    size: 12,
    fillColor: GREY.soft,
  });

  // Info strip: three label/value pairs across the seven columns.
  const info = sheet.addRow([
    labels.plaque,
    plaque ?? "-",
    labels.reportType,
    variantLabel(variant),
    labels.reportDate,
    formatPersianDate(new Date()),
    "",
  ]);
  info.height = 20;
  sheet.mergeCells(info.number, 6, info.number, 7);
  for (let col = 1; col <= LAST_COL; col++) {
    const cell = info.getCell(col);
    const isLabel = col === 1 || col === 3 || col === 5;
    cell.font = { name: FONT, size: 9, bold: isLabel };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      readingOrder: "rtl",
    };
    if (isLabel) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREY.soft },
      };
    }
  }
  border(info);

  addBanner(
    sheet,
    lastBankTransactionDate
      ? `${labels.lastBankTransactionNotePrefix} ${formatPersianDate(
          lastBankTransactionDate
        )} — ${labels.lastBankTransactionNoteSuffix}`
      : labels.noBankTransactionNote,
    {
      height: 30,
      size: 9,
      bold: false,
      italic: true,
      fillColor: GREY.soft,
      wrap: true,
    }
  );

  sheet.addRow([]).height = 6; // spacer
}

function addColumnHeader(sheet: Worksheet) {
  const row = sheet.addRow(COLUMNS.map((column) => column.header));
  row.height = 26;
  for (let col = 1; col <= LAST_COL; col++) {
    const cell = row.getCell(col);
    cell.font = { name: FONT, size: 9, bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
      readingOrder: "rtl",
    };
  }
  fill(row, GREY.title);
  border(row);
}

/** Renders one ledger block: section banner (optional), column header, data
 *  rows and the section total. Returns the section balance. */
function addSection(
  sheet: Worksheet,
  {
    charges,
    payments,
    sectionTitle,
    totalLabel,
  }: {
    charges: Charge[];
    payments: Payment[];
    sectionTitle?: string;
    totalLabel: string;
  }
): number {
  if (sectionTitle) {
    addBanner(sheet, sectionTitle, {
      height: 22,
      size: 11,
      fillColor: GREY.band,
    });
  }

  addColumnHeader(sheet);

  const { rows, total } = buildLedger(charges, payments);

  if (rows.length === 0) {
    const empty = sheet.addRow([labels.noTransactionsInSection]);
    sheet.mergeCells(empty.number, 1, empty.number, LAST_COL);
    empty.height = 20;
    empty.getCell(1).font = { name: FONT, size: 9, italic: true };
    empty.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
      readingOrder: "rtl",
    };
    border(empty);
  }

  rows.forEach((item) => {
    const values = [
      item.typeLabel,
      item.title,
      item.personName,
      formatPersianDate(item.date),
      item.amount,
      item.balance,
      item.description,
    ];
    const row = sheet.addRow(values);
    row.height = wrappedRowHeight(item.title, item.description);

    for (let col = 1; col <= LAST_COL; col++) {
      const spec = COLUMNS[col - 1];
      const cell = row.getCell(col);
      cell.font = { name: FONT, size: 9 };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: "wrap" in spec && spec.wrap === true,
        readingOrder: "rtl",
      };
      if ("currency" in spec && spec.currency === true) {
        cell.numFmt = CURRENCY_FORMAT;
      }
    }

    // The running balance carries the weight the on-screen colouring used to:
    // a positive figure means the unit still owes money, and prints with a
    // leading minus sign when it is in credit.
    row.getCell(6).font = { name: FONT, size: 9, bold: true };

    // Charge rows stay white; payments take the faintest tint so the two are
    // still tellable apart on a mono printer.
    fill(row, item.isCharge ? undefined : GREY.faint);
    border(row);
  });

  addTotalRow(sheet, totalLabel, total, GREY.band);
  return total;
}

function addTotalRow(
  sheet: Worksheet,
  label: string,
  value: number,
  fillColor: string,
  /** The grand total gets a heavier rule — greyscale fills alone are too close
   *  in tone to separate it from the per-section totals in print. */
  strong = false
) {
  const row = sheet.addRow(["", "", "", "", "", value, ""]);
  row.height = 22;
  // Label spans the five leading columns; the amount sits under "مانده".
  sheet.mergeCells(row.number, 1, row.number, 5);
  row.getCell(1).value = label;
  row.getCell(1).font = { name: FONT, size: 10, bold: true };
  row.getCell(1).alignment = {
    horizontal: "center",
    vertical: "middle",
    readingOrder: "rtl",
  };

  const amount = row.getCell(6);
  amount.numFmt = CURRENCY_FORMAT;
  amount.font = { name: FONT, size: 10, bold: true };
  amount.alignment = { horizontal: "center", vertical: "middle" };

  row.getCell(7).font = { name: FONT, size: 10 };
  row.getCell(7).alignment = { horizontal: "center", vertical: "middle" };

  fill(row, fillColor);
  border(row);

  if (strong) borderRow(row, LAST_COL, STRONG_BORDER);
}

/** Prints the renter/owner split of the monthly balance directly underneath the
 *  monthly total, with a footnote explaining that ex-renter debt sits with the
 *  owner. */
function addMonthlyShareBlock(
  sheet: Worksheet,
  { charges, payments, renterId, ownerName, renterName }: BalanceDetailExcelOptions
) {
  const share = calculateMonthlyShare(charges, payments, renterId);
  const withName = (label: string, name?: string) =>
    name ? `${label} — ${name}` : label;

  addTotalRow(
    sheet,
    withName(labels.renterShareOfMonthly, renterName),
    share.renter,
    GREY.soft
  );
  addTotalRow(
    sheet,
    withName(labels.ownerShareOfMonthly, ownerName),
    share.owner,
    GREY.soft
  );
  addBanner(sheet, labels.exRenterShareNote, {
    height: 20,
    size: 8,
    bold: false,
    italic: true,
    fillColor: GREY.soft,
    wrap: true,
  });
}

// ── entry point ─────────────────────────────────────────────────────────────

export const buildBalanceDetailWorkbook = async (
  options: BalanceDetailExcelOptions
): Promise<Workbook> => {
  const { charges, payments, variant } = options;

  const { workbook, sheet } = await createReportSheet(
    labels.balanceDetailSheetName
  );

  sheet.columns = COLUMNS.map((column) => ({ width: column.width }));

  addHeaderBlock(sheet, options);

  if (variant === "all") {
    // Monthly first, proprietor underneath, then the combined balance.
    const monthlyBalance = addSection(sheet, {
      charges: charges.filter((charge) => !charge.proprietor),
      payments: payments.filter((payment) => !payment.proprietor),
      sectionTitle: labels.monthlyChargeSection,
      totalLabel: labels.totalChargeBalance,
    });

    if (options.renterId) addMonthlyShareBlock(sheet, options);

    sheet.addRow([]).height = 8;

    const proprietorBalance = addSection(sheet, {
      charges: charges.filter((charge) => charge.proprietor),
      payments: payments.filter((payment) => payment.proprietor),
      sectionTitle: labels.proprietorChargeSection,
      totalLabel: labels.totalProprietorBalance,
    });

    sheet.addRow([]).height = 8;

    addTotalRow(
      sheet,
      labels.totalBalance,
      monthlyBalance + proprietorBalance,
      GREY.title,
      true
    );
  } else {
    addSection(sheet, {
      charges,
      payments,
      totalLabel:
        variant === "proprietor"
          ? labels.totalProprietorBalance
          : labels.totalChargeBalance,
    });

    // Proprietor charges are the owner's by definition — only the monthly
    // ledger needs the split.
    if (variant === "non-proprietor" && options.renterId) {
      addMonthlyShareBlock(sheet, options);
    }
  }

  return workbook;
};

export const exportBalanceDetailToExcel = async (
  options: BalanceDetailExcelOptions
) => {
  const { fileName = "Balance-Detail-Report" } = options;
  const workbook = await buildBalanceDetailWorkbook(options);
  await downloadWorkbook(workbook, fileName);
};
