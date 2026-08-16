import type { Row, Workbook, Worksheet } from "exceljs";
import type { ShopBalanceDetails, ShopsBalanceData } from "@/schema/balanceSchema";
import { labels } from "./label";
import { formatPersianDate } from "./localeDate";
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
} from "./excelReport";

/** Which list the sheet covers. "monthly" and "yearly" mirror the `proprietor`
 *  flag passed to getAllShopsBalance; "rent" is the kiosk/board/parking list,
 *  which has no owner/renter split to print. */
export type ShopsBalanceVariant = "monthly" | "yearly" | "rent";

/** The rent list arrives as ShopsBalanceData (a single `balance`), the shop
 *  lists as ShopBalanceDetails (owner/renter/total). Normalised on the way in so
 *  the sheet builder only deals with one shape. */
export type ShopsBalanceRow = ShopBalanceDetails | ShopsBalanceData;

export interface ShopsBalanceExcelOptions {
  shops: ShopsBalanceRow[];
  variant: ShopsBalanceVariant;
  /** Newest bank statement row in the database — printed as a warning so the
   *  reader knows later payments are not in this report yet. */
  lastBankTransactionDate?: Date | null;
  /** Debt threshold the on-screen list was filtered by, in rials. Printed as a
   *  note so a short list is never mistaken for the whole complex. */
  minDebt?: number | null;
  fileName?: string;
}

interface ShopRow {
  plaque: number;
  ownerName: string;
  renterName: string | null;
  ownerBalance: number;
  renterBalance: number;
  totalBalance: number;
}

function normalise(shop: ShopsBalanceRow): ShopRow {
  if ("totalBalance" in shop) return shop;
  // The rent list carries no split: the whole balance sits under "مانده کل",
  // which is the only balance column the rent layout prints anyway.
  return {
    plaque: shop.plaque,
    ownerName: shop.ownerName,
    renterName: shop.renterName,
    ownerBalance: 0,
    renterBalance: 0,
    totalBalance: shop.balance,
  };
}

// ── sheet geometry ──────────────────────────────────────────────────────────
// Widths are sized to the printable width of A4 portrait with narrow margins
// (~698px; px ≈ width × 7 + 5). fitToWidth is the safety net.

interface ColumnSpec {
  header: string;
  width: number;
  value: (shop: ShopRow, index: number) => string | number;
  currency?: boolean;
}

interface Layout {
  columns: ColumnSpec[];
  lastCol: number;
  /** 1-based index of the "مانده کل" column — where every total is aligned. */
  totalCol: number;
  /** How far the label of a full-width total row is merged. */
  labelSpan: number;
}

/** Balances are stored as payment − charge: a negative figure is money the unit
 *  still owes. */
function statusOf(balance: number): string {
  if (balance > 0) return labels.statusCreditor;
  if (balance < 0) return labels.statusDebtor;
  return labels.statusSettled;
}

function layoutFor(variant: ShopsBalanceVariant): Layout {
  const withSplit = variant !== "rent";

  const columns: ColumnSpec[] = [
    { header: labels.rowNumber, width: 4.5, value: (_, index) => index + 1 },
    { header: labels.plaque, width: 7, value: (shop) => shop.plaque },
    {
      header: labels.ownerName,
      width: withSplit ? 16 : 24,
      value: (shop) => shop.ownerName,
    },
    {
      header: labels.renterName,
      width: withSplit ? 16 : 24,
      value: (shop) => shop.renterName ?? "—",
    },
  ];

  if (withSplit) {
    columns.push(
      {
        // The owner column means different things per report: the monthly sheet
        // splits the charge between owner and renter, the yearly one is
        // proprietor charge, which is the owner's by definition.
        header:
          variant === "yearly"
            ? labels.totalProprietorBalance
            : labels.totalOwnerBalance,
        width: 13,
        value: (shop) => shop.ownerBalance,
        currency: true,
      },
      {
        header: labels.totalRenterBalance,
        width: 13,
        value: (shop) => shop.renterBalance,
        currency: true,
      }
    );
  }

  columns.push(
    {
      header: labels.totalBalance,
      width: withSplit ? 13.5 : 17,
      value: (shop) => shop.totalBalance,
      currency: true,
    },
    {
      header: labels.status,
      width: withSplit ? 8 : 11,
      value: (shop) => statusOf(shop.totalBalance),
    }
  );

  const totalCol = columns.length - 1; // the "مانده کل" column
  const firstCurrencyCol = columns.findIndex((column) => column.currency) + 1;

  return {
    columns,
    lastCol: columns.length,
    totalCol,
    labelSpan: firstCurrencyCol - 1,
  };
}

const border = (
  row: Row,
  layout: Layout,
  style?: Parameters<typeof borderRow>[2]
) => borderRow(row, layout.lastCol, style);

const fill = (row: Row, layout: Layout, argb?: string) =>
  fillRow(row, layout.lastCol, argb);

const addBanner = (
  sheet: Worksheet,
  layout: Layout,
  text: string,
  opts: BannerOptions
) => addBannerRow(sheet, layout.lastCol, text, opts);

function reportTitle(variant: ShopsBalanceVariant): string {
  if (variant === "yearly") return labels.allShopsYearlyBalance;
  if (variant === "rent") return labels.allRentsBalance;
  return labels.allShopsMonthlyBalance;
}

/** Same vocabulary the per-unit report uses for its sections. */
function chargeKind(variant: ShopsBalanceVariant): string {
  if (variant === "yearly") return labels.proprietorChargeSection;
  if (variant === "rent") return labels.rentCharge;
  return labels.monthlyChargeSection;
}

function sheetName(variant: ShopsBalanceVariant): string {
  if (variant === "yearly") return labels.shopsBalanceYearlySheetName;
  if (variant === "rent") return labels.rentsBalanceSheetName;
  return labels.shopsBalanceMonthlySheetName;
}

// ── sheet building ──────────────────────────────────────────────────────────

/** Lays out three label/value pairs across the header strip: every label takes
 *  one column and the three values share what is left, so the strip fills the
 *  sheet at either width. Returns six [startCol, endCol] spans. */
function infoStripSpans(lastCol: number): Array<[number, number]> {
  const valueCols = lastCol - 3;
  const base = Math.floor(valueCols / 3);
  const extra = valueCols % 3;

  const spans: Array<[number, number]> = [];
  let col = 1;
  for (let pair = 0; pair < 3; pair++) {
    spans.push([col, col]);
    // Spare columns go to the rightmost values, where the date sits.
    const width = base + (pair >= 3 - extra ? 1 : 0);
    spans.push([col + 1, col + width]);
    col += width + 1;
  }
  return spans;
}

function addHeaderBlock(
  sheet: Worksheet,
  layout: Layout,
  {
    shops,
    variant,
    lastBankTransactionDate,
    minDebt,
  }: Omit<ShopsBalanceExcelOptions, "shops"> & { shops: ShopRow[] }
) {
  addBanner(sheet, layout, labels.complexName, {
    height: 30,
    size: 15,
    fillColor: GREY.title,
  });

  addBanner(sheet, layout, reportTitle(variant), {
    height: 22,
    size: 12,
    fillColor: GREY.soft,
  });

  // Info strip: three label/value pairs laid out across whatever width the
  // variant has.
  const info = sheet.addRow([]);
  info.height = 20;
  const spans = infoStripSpans(layout.lastCol);
  const values = [
    labels.reportType,
    chargeKind(variant),
    labels.shopCount,
    shops.length,
    labels.reportDate,
    formatPersianDate(new Date()),
  ];
  const labelCols: number[] = [];
  spans.forEach(([start, end], slot) => {
    info.getCell(start).value = values[slot];
    if (slot % 2 === 0) labelCols.push(start);
    if (end > start) sheet.mergeCells(info.number, start, info.number, end);
  });

  for (let col = 1; col <= layout.lastCol; col++) {
    const cell = info.getCell(col);
    const isLabel = labelCols.includes(col);
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
  border(info, layout);

  addBanner(
    sheet,
    layout,
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

  if (minDebt) {
    addBanner(
      sheet,
      layout,
      `${labels.debtFilterNotePrefix} ${minDebt.toLocaleString("en-US")} ${
        labels.debtFilterNoteSuffix
      }`,
      {
        height: 20,
        size: 9,
        bold: false,
        italic: true,
        fillColor: GREY.soft,
        wrap: true,
      }
    );
  }

  sheet.addRow([]).height = 6; // spacer
}

function addColumnHeader(sheet: Worksheet, layout: Layout): Row {
  const row = sheet.addRow(layout.columns.map((column) => column.header));
  row.height = 30;
  for (let col = 1; col <= layout.lastCol; col++) {
    const cell = row.getCell(col);
    cell.font = { name: FONT, size: 9, bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
      readingOrder: "rtl",
    };
  }
  fill(row, layout, GREY.title);
  border(row, layout);
  return row;
}

function addShopRows(sheet: Worksheet, layout: Layout, shops: ShopRow[]) {
  if (shops.length === 0) {
    addBanner(sheet, layout, labels.noShopsInReport, {
      height: 20,
      size: 9,
      bold: false,
      italic: true,
    });
    return;
  }

  shops.forEach((shop, index) => {
    const row = sheet.addRow(
      layout.columns.map((column) => column.value(shop, index))
    );
    row.height = 20;

    for (let col = 1; col <= layout.lastCol; col++) {
      const cell = row.getCell(col);
      cell.font = { name: FONT, size: 9 };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        readingOrder: "rtl",
      };
      if (layout.columns[col - 1].currency) cell.numFmt = CURRENCY_FORMAT;
    }
    // The combined balance is what the reader scans for, so it carries the
    // weight the on-screen colouring used to.
    row.getCell(layout.totalCol).font = { name: FONT, size: 9, bold: true };

    // Zebra banding: on a list this long it is what keeps the eye on one plaque
    // across the full width of the page.
    fill(row, layout, index % 2 === 1 ? GREY.faint : undefined);
    border(row, layout);
  });
}

/** Sums every currency column under its own heading. */
function addGrandTotalRow(sheet: Worksheet, layout: Layout, shops: ShopRow[]) {
  const row = sheet.addRow(
    layout.columns.map((column, index) =>
      index === 0
        ? labels.grandTotal
        : column.currency
          ? shops.reduce(
              (total, shop) => total + (column.value(shop, 0) as number),
              0
            )
          : ""
    )
  );
  row.height = 24;
  sheet.mergeCells(row.number, 1, row.number, layout.labelSpan);

  for (let col = 1; col <= layout.lastCol; col++) {
    const cell = row.getCell(col);
    cell.font = { name: FONT, size: 10, bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      readingOrder: "rtl",
    };
    if (layout.columns[col - 1].currency) cell.numFmt = CURRENCY_FORMAT;
  }

  fill(row, layout, GREY.title);
  border(row, layout, STRONG_BORDER);
}

/** One label/value line under the grand total, aligned to the "مانده کل" column. */
function addSummaryRow(
  sheet: Worksheet,
  layout: Layout,
  label: string,
  value: number
) {
  const row = sheet.addRow([]);
  row.height = 20;
  sheet.mergeCells(row.number, 1, row.number, layout.totalCol - 1);
  row.getCell(1).value = label;
  row.getCell(1).font = { name: FONT, size: 9, bold: true };
  row.getCell(1).alignment = {
    horizontal: "center",
    vertical: "middle",
    readingOrder: "rtl",
  };

  const amount = row.getCell(layout.totalCol);
  amount.value = value;
  amount.numFmt = CURRENCY_FORMAT;
  amount.font = { name: FONT, size: 9, bold: true };
  amount.alignment = { horizontal: "center", vertical: "middle" };

  row.getCell(layout.lastCol).font = { name: FONT, size: 9 };

  fill(row, layout, GREY.soft);
  border(row, layout);
}

// ── entry point ─────────────────────────────────────────────────────────────

export const buildShopsBalanceWorkbook = async (
  options: ShopsBalanceExcelOptions
): Promise<Workbook> => {
  const { variant } = options;
  const shops = options.shops.map(normalise);
  const layout = layoutFor(variant);

  const { workbook, sheet } = await createReportSheet(sheetName(variant));
  sheet.columns = layout.columns.map((column) => ({ width: column.width }));

  addHeaderBlock(sheet, layout, { ...options, shops });
  const headerRow = addColumnHeader(sheet, layout);
  addShopRows(sheet, layout, shops);
  addGrandTotalRow(sheet, layout, shops);

  // Debtors and creditors cancel each other out in the grand total, so both
  // sides are spelled out underneath it.
  const debtors = shops.filter((shop) => shop.totalBalance < 0);
  const creditors = shops.filter((shop) => shop.totalBalance > 0);
  const sumBalance = (rows: ShopRow[]) =>
    rows.reduce((total, shop) => total + shop.totalBalance, 0);
  addSummaryRow(
    sheet,
    layout,
    `${labels.totalDebtors} (${debtors.length} ${labels.unit})`,
    sumBalance(debtors)
  );
  addSummaryRow(
    sheet,
    layout,
    `${labels.totalCreditors} (${creditors.length} ${labels.unit})`,
    sumBalance(creditors)
  );

  // The list runs to several pages, so the column header repeats on each one and
  // the pages are numbered.
  sheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;
  sheet.headerFooter.oddFooter = `&C&"${FONT}"&8${labels.page} &P ${labels.pageOf} &N`;

  return workbook;
};

export const exportShopsBalanceToExcel = async (
  options: ShopsBalanceExcelOptions
) => {
  const { fileName = "Shops-Balance-Report" } = options;
  const workbook = await buildShopsBalanceWorkbook(options);
  await downloadWorkbook(workbook, fileName);
};
