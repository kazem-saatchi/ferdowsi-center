// Printable report for /admin/all-charge-reference: the reference amounts one
// of the three lists bills from, on the same A4 sheet as the other reports.
import type { Row, Workbook, Worksheet } from "exceljs";
import type { ShopChargeReference, ShopType } from "@prisma/client";
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
import { shopTypeLabel } from "./shopType";

/** Which of the page's three tabs the sheet covers. */
export type ChargeReferenceVariant = "monthly" | "yearly" | "rent";

export interface ChargeReferenceExcelOptions {
  rows: ShopChargeReference[];
  variant: ChargeReferenceVariant;
  /** The unit-type button the list was narrowed by, if any — printed so a
   *  filtered sheet is never mistaken for the whole complex. */
  shopTypeFilter?: ShopType;
  fileName?: string;
}

// ── sheet geometry ──────────────────────────────────────────────────────────
// Sized to A4 portrait with narrow margins (~698px; px ≈ width × 7 + 5), as in
// the other reports; fitToWidth is the safety net.

interface ColumnSpec {
  header: string;
  width: number;
  value: (row: ShopChargeReference, index: number) => string | number;
  currency?: boolean;
  /** Summed in the grand total row. */
  sum?: (row: ShopChargeReference) => number;
  decimals?: number;
}

/** The kiosk, parking and board rows carry no per-metre rate — the amount is set
 *  on the unit itself. A dash reads better than a column of zeros. */
const rate = (amount: number): string | number => (amount > 0 ? amount : "—");

const COLUMNS: ColumnSpec[] = [
  { header: labels.rowNumber, width: 4.5, value: (_, index) => index + 1 },
  { header: labels.plaque, width: 7, value: (row) => row.plaque },
  {
    header: labels.type,
    width: 9,
    value: (row) => shopTypeLabel(row.shopType),
  },
  {
    header: labels.areaM2,
    width: 12,
    value: (row) => row.area,
    sum: (row) => row.area,
    decimals: 2,
  },
  {
    header: labels.constAmount,
    width: 13,
    value: (row) => rate(row.constantAmount),
    currency: true,
  },
  {
    header: labels.metricAmount,
    width: 13,
    value: (row) => rate(row.metricAmount),
    currency: true,
  },
  {
    header: labels.referenceAmount,
    width: 16,
    value: (row) => row.totalAmount,
    currency: true,
    sum: (row) => row.totalAmount,
  },
  { header: labels.referenceYear, width: 8, value: (row) => row.year },
];

const LAST_COL = COLUMNS.length;
/** The reference amount column — where every total is aligned. */
const AMOUNT_COL = COLUMNS.length - 1;
/** How far the label of a full-width total row is merged. */
const LABEL_SPAN = COLUMNS.findIndex((column) => column.sum);

const border = (row: Row, style?: Parameters<typeof borderRow>[2]) =>
  borderRow(row, LAST_COL, style);

const fill = (row: Row, argb?: string) => fillRow(row, LAST_COL, argb);

const addBanner = (sheet: Worksheet, text: string, opts: BannerOptions) =>
  addBannerRow(sheet, LAST_COL, text, opts);

const centre = (wrap = false) =>
  ({
    horizontal: "center",
    vertical: "middle",
    wrapText: wrap,
    readingOrder: "rtl",
  }) as const;

function reportTitle(variant: ChargeReferenceVariant): string {
  if (variant === "yearly") return labels.chargeReferenceYearlyTitle;
  if (variant === "rent") return labels.chargeReferenceRentTitle;
  return labels.chargeReferenceMonthlyTitle;
}

/** Same vocabulary the page's tabs use. */
function chargeKind(variant: ChargeReferenceVariant): string {
  if (variant === "yearly") return labels.proprietorCharge;
  if (variant === "rent") return labels.rentCharge;
  return labels.monthlyCharge;
}

// ── sheet building ──────────────────────────────────────────────────────────

/** Four label/value pairs across the header strip, one column each. */
function addInfoStrip(
  sheet: Worksheet,
  { rows, variant, shopTypeFilter }: ChargeReferenceExcelOptions
) {
  const row = sheet.addRow([
    labels.reportType,
    chargeKind(variant),
    labels.unitTypeFilter,
    shopTypeFilter ? shopTypeLabel(shopTypeFilter) : labels.all,
    labels.shopCount,
    rows.length,
    labels.reportDate,
    formatPersianDate(new Date()),
  ]);
  row.height = 20;

  for (let col = 1; col <= LAST_COL; col++) {
    const cell = row.getCell(col);
    const isLabel = col % 2 === 1;
    cell.font = { name: FONT, size: 9, bold: isLabel };
    cell.alignment = centre();
    if (isLabel) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREY.soft },
      };
    }
  }
  border(row);
}

function addHeaderBlock(sheet: Worksheet, options: ChargeReferenceExcelOptions) {
  addBanner(sheet, labels.complexName, {
    height: 30,
    size: 15,
    fillColor: GREY.title,
  });
  addBanner(sheet, reportTitle(options.variant), {
    height: 22,
    size: 12,
    fillColor: GREY.soft,
  });

  addInfoStrip(sheet, options);

  // Only the monthly and مالکانه lists are built from rates; saying so up front
  // stops the dashes in those two columns from reading as missing data.
  if (options.rows.some((row) => row.constantAmount === 0 && row.metricAmount === 0)) {
    addBanner(sheet, labels.zeroRateNote, {
      height: 26,
      size: 9,
      bold: false,
      italic: true,
      fillColor: GREY.soft,
      wrap: true,
    });
  }

  sheet.addRow([]).height = 6; // spacer
}

function addColumnHeader(sheet: Worksheet): Row {
  const row = sheet.addRow(COLUMNS.map((column) => column.header));
  row.height = 30;
  for (let col = 1; col <= LAST_COL; col++) {
    const cell = row.getCell(col);
    cell.font = { name: FONT, size: 9, bold: true };
    cell.alignment = centre(true);
  }
  fill(row, GREY.title);
  border(row);
  return row;
}

function styleDataRow(row: Row, bold = false) {
  for (let col = 1; col <= LAST_COL; col++) {
    const cell = row.getCell(col);
    const column = COLUMNS[col - 1];
    cell.font = { name: FONT, size: 9, bold };
    cell.alignment = centre();
    if (column.currency && typeof cell.value === "number") {
      cell.numFmt = CURRENCY_FORMAT;
    }
    if (column.decimals && typeof cell.value === "number") {
      cell.numFmt = `#,##0.${"0".repeat(column.decimals)}`;
    }
  }
}

function addReferenceRows(sheet: Worksheet, rows: ShopChargeReference[]) {
  if (rows.length === 0) {
    addBanner(sheet, labels.noChargeReferenceRows, {
      height: 20,
      size: 9,
      bold: false,
      italic: true,
    });
    return;
  }

  rows.forEach((reference, index) => {
    const row = sheet.addRow(
      COLUMNS.map((column) => column.value(reference, index))
    );
    row.height = 20;
    styleDataRow(row);
    // The amount is what the reader scans for, so it carries the weight the
    // on-screen table gave it with a larger font.
    row.getCell(AMOUNT_COL).font = { name: FONT, size: 9, bold: true };

    // Zebra banding keeps the eye on one plaque across the full page width.
    fill(row, index % 2 === 1 ? GREY.faint : undefined);
    border(row);
  });
}

/** Sums the area and the reference amount under their own headings. */
function addGrandTotalRow(sheet: Worksheet, rows: ShopChargeReference[]) {
  const row = sheet.addRow(
    COLUMNS.map((column, index) =>
      index === 0
        ? labels.grandTotal
        : column.sum
          ? rows.reduce((total, reference) => total + column.sum!(reference), 0)
          : ""
    )
  );
  row.height = 24;
  sheet.mergeCells(row.number, 1, row.number, LABEL_SPAN);
  styleDataRow(row, true);
  row.eachCell((cell) => {
    cell.font = { name: FONT, size: 10, bold: true };
  });
  fill(row, GREY.title);
  border(row, STRONG_BORDER);
}

/** One label/value line under the grand total, aligned to the amount column. */
function addSummaryRow(sheet: Worksheet, label: string, value: number) {
  const row = sheet.addRow([]);
  row.height = 20;
  sheet.mergeCells(row.number, 1, row.number, AMOUNT_COL - 1);
  row.getCell(1).value = label;
  row.getCell(1).font = { name: FONT, size: 9, bold: true };
  row.getCell(1).alignment = centre();

  const amount = row.getCell(AMOUNT_COL);
  amount.value = value;
  amount.numFmt = CURRENCY_FORMAT;
  amount.font = { name: FONT, size: 9, bold: true };
  amount.alignment = centre();

  row.getCell(LAST_COL).font = { name: FONT, size: 9 };
  fill(row, GREY.soft);
  border(row);
}

/** What each unit type contributes to the list — the question the page's filter
 *  buttons are asking, answered once without reprinting the sheet per type. */
function addTypeBreakdown(sheet: Worksheet, rows: ShopChargeReference[]) {
  const byType = new Map<ShopType, { count: number; total: number }>();
  rows.forEach((reference) => {
    const entry = byType.get(reference.shopType) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += reference.totalAmount;
    byType.set(reference.shopType, entry);
  });

  if (byType.size < 2) return; // a single-type list is already its own total

  sheet.addRow([]).height = 6;
  addBanner(sheet, labels.typeSummaryTitle, {
    height: 20,
    size: 10,
    fillColor: GREY.band,
  });

  Array.from(byType.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([type, entry]) => {
      addSummaryRow(
        sheet,
        `${shopTypeLabel(type)} (${entry.count} ${labels.unit})`,
        entry.total
      );
    });
}

// ── entry point ─────────────────────────────────────────────────────────────

export const buildChargeReferenceWorkbook = async (
  options: ChargeReferenceExcelOptions
): Promise<Workbook> => {
  const { rows } = options;
  const { workbook, sheet } = await createReportSheet(
    labels.chargeReferenceSheetName
  );
  sheet.columns = COLUMNS.map((column) => ({ width: column.width }));

  addHeaderBlock(sheet, options);
  const headerRow = addColumnHeader(sheet);
  addReferenceRows(sheet, rows);

  if (rows.length > 0) {
    addGrandTotalRow(sheet, rows);
    const total = rows.reduce((sum, row) => sum + row.totalAmount, 0);
    addSummaryRow(
      sheet,
      labels.averageAmount,
      Math.round(total / rows.length)
    );
    addTypeBreakdown(sheet, rows);
  }

  // The list runs past one page, so the column header repeats and the pages are
  // numbered.
  sheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;
  sheet.headerFooter.oddFooter = `&C&"${FONT}"&8${labels.page} &P ${labels.pageOf} &N`;

  return workbook;
};

export const exportChargeReferenceToExcel = async (
  options: ChargeReferenceExcelOptions
) => {
  const workbook = await buildChargeReferenceWorkbook(options);
  await downloadWorkbook(
    workbook,
    options.fileName ?? `Charge-Reference-${options.variant}`
  );
};
