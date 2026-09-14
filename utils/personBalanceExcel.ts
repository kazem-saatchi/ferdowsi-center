// Printable report for /admin/person-balance: one person, one row per unit they
// hold, on the same A4 sheet as the other balance reports.
import type { Row, Workbook, Worksheet } from "exceljs";
import type {
  PersonBalanceSummary,
  PersonUnitBalance,
} from "@/app/api/actions/balance/getPersonBalance";
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

export interface PersonBalanceExcelOptions {
  person: { firstName: string; lastName: string; IdNumber: string; phoneOne: string };
  units: PersonUnitBalance[];
  summary: PersonBalanceSummary;
  fileName?: string;
}

// ── sheet geometry ──────────────────────────────────────────────────────────
// Sized to A4 portrait with narrow margins (~698px; px ≈ width × 7 + 5), as in
// the all-shops report; fitToWidth is the safety net.

interface ColumnSpec {
  header: string;
  width: number;
  value: (unit: PersonUnitBalance, index: number) => string | number;
  currency?: boolean;
}

/** Balances here are charge − payment: a positive figure is money still owed,
 *  which is the opposite of the all-shops lists and matches this page. */
function statusOf(balance: number): string {
  if (balance > 0) return labels.statusDebtor;
  if (balance < 0) return labels.statusCreditor;
  return labels.statusSettled;
}

export function roleOf(unit: PersonUnitBalance): string {
  if (unit.isOwner && unit.isRenter) return labels.roleOwnerAndRenter;
  return unit.isOwner ? labels.roleOwner : labels.roleRenter;
}

const COLUMNS: ColumnSpec[] = [
  { header: labels.rowNumber, width: 4.5, value: (_, index) => index + 1 },
  { header: labels.plaque, width: 7, value: (unit) => unit.plaque },
  { header: labels.type, width: 9, value: (unit) => shopTypeLabel(unit.type) },
  { header: labels.personRole, width: 11, value: roleOf },
  {
    header: labels.unitTotalCharge,
    width: 14,
    value: (unit) => unit.totalCharge,
    currency: true,
  },
  {
    header: labels.unitTotalPayment,
    width: 14,
    value: (unit) => unit.totalPayment,
    currency: true,
  },
  {
    header: labels.personNetBalance,
    width: 14,
    value: (unit) => unit.balance,
    currency: true,
  },
  { header: labels.status, width: 9, value: (unit) => statusOf(unit.balance) },
];

const LAST_COL = COLUMNS.length;
/** The balance column — where every total is aligned. */
const BALANCE_COL = COLUMNS.length - 1;
/** How far the label of a full-width total row is merged. */
const LABEL_SPAN = COLUMNS.findIndex((column) => column.currency);

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

// ── sheet building ──────────────────────────────────────────────────────────

/** Lays out four label/value pairs across the header strip, each pair taking one
 *  column for the label and one for the value. */
function addInfoStrip(
  sheet: Worksheet,
  person: PersonBalanceExcelOptions["person"]
) {
  const row = sheet.addRow([
    labels.person,
    `${person.firstName} ${person.lastName}`,
    labels.idNumber,
    person.IdNumber,
    labels.primaryPhone,
    person.phoneOne,
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

function addHeaderBlock(
  sheet: Worksheet,
  { person, summary }: PersonBalanceExcelOptions
) {
  addBanner(sheet, labels.complexName, {
    height: 30,
    size: 15,
    fillColor: GREY.title,
  });
  addBanner(sheet, labels.personBalanceReportTitle, {
    height: 22,
    size: 12,
    fillColor: GREY.soft,
  });

  addInfoStrip(sheet, person);

  addBanner(
    sheet,
    `${labels.shopCount}: ${summary.unitCount} — ${labels.personDebtUnits}: ${summary.debtUnitCount}`,
    { height: 18, size: 9, fillColor: GREY.soft }
  );

  // The reader has to know these are unit figures, not the person's own slice
  // of the ledger, or the report repeats the confusion it was built to end.
  addBanner(sheet, labels.personUnitsHint, {
    height: 28,
    size: 9,
    bold: false,
    italic: true,
    fillColor: GREY.soft,
    wrap: true,
  });

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

function addUnitRows(sheet: Worksheet, units: PersonUnitBalance[]) {
  if (units.length === 0) {
    addBanner(sheet, labels.personNoUnits, {
      height: 20,
      size: 9,
      bold: false,
      italic: true,
    });
    return;
  }

  units.forEach((unit, index) => {
    const row = sheet.addRow(
      COLUMNS.map((column) => column.value(unit, index))
    );
    row.height = 20;

    for (let col = 1; col <= LAST_COL; col++) {
      const cell = row.getCell(col);
      cell.font = { name: FONT, size: 9 };
      cell.alignment = centre();
      if (COLUMNS[col - 1].currency) cell.numFmt = CURRENCY_FORMAT;
    }
    row.getCell(BALANCE_COL).font = { name: FONT, size: 9, bold: true };

    fill(row, index % 2 === 1 ? GREY.faint : undefined);
    border(row);
  });
}

function addGrandTotalRow(sheet: Worksheet, summary: PersonBalanceSummary) {
  const row = sheet.addRow([
    labels.grandTotal,
    "",
    "",
    "",
    summary.totalCharge,
    summary.totalPayment,
    summary.balance,
    statusOf(summary.balance),
  ]);
  row.height = 24;
  sheet.mergeCells(row.number, 1, row.number, LABEL_SPAN);

  for (let col = 1; col <= LAST_COL; col++) {
    const cell = row.getCell(col);
    cell.font = { name: FONT, size: 10, bold: true };
    cell.alignment = centre();
    if (COLUMNS[col - 1].currency) cell.numFmt = CURRENCY_FORMAT;
  }

  fill(row, GREY.title);
  border(row, STRONG_BORDER);
}

/** The part of the ledger raised against this person, printed under the total so
 *  a disputed handover can be traced without a second report. */
function addOwnShareRows(sheet: Worksheet, units: PersonUnitBalance[]) {
  const ownCharge = units.reduce((sum, unit) => sum + unit.ownCharge, 0);
  const ownPayment = units.reduce((sum, unit) => sum + unit.ownPayment, 0);

  ([
    [labels.ownChargeShare, ownCharge],
    [labels.ownPaymentShare, ownPayment],
  ] as Array<[string, number]>).forEach(([label, value]) => {
    const row = sheet.addRow([]);
    row.height = 20;
    sheet.mergeCells(row.number, 1, row.number, BALANCE_COL - 1);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: FONT, size: 9, bold: true };
    row.getCell(1).alignment = centre();

    const amount = row.getCell(BALANCE_COL);
    amount.value = value;
    amount.numFmt = CURRENCY_FORMAT;
    amount.font = { name: FONT, size: 9, bold: true };
    amount.alignment = centre();

    row.getCell(LAST_COL).font = { name: FONT, size: 9 };
    fill(row, GREY.soft);
    border(row);
  });
}

// ── entry point ─────────────────────────────────────────────────────────────

export const buildPersonBalanceWorkbook = async (
  options: PersonBalanceExcelOptions
): Promise<Workbook> => {
  const { workbook, sheet } = await createReportSheet(
    labels.personBalanceSheetName
  );
  sheet.columns = COLUMNS.map((column) => ({ width: column.width }));

  addHeaderBlock(sheet, options);
  const headerRow = addColumnHeader(sheet);
  addUnitRows(sheet, options.units);
  if (options.units.length > 0) {
    addGrandTotalRow(sheet, options.summary);
    addOwnShareRows(sheet, options.units);
  }

  sheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;
  sheet.headerFooter.oddFooter = `&C&"${FONT}"&8${labels.page} &P ${labels.pageOf} &N`;

  return workbook;
};

export const exportPersonBalanceToExcel = async (
  options: PersonBalanceExcelOptions
) => {
  const { person, fileName } = options;
  const workbook = await buildPersonBalanceWorkbook(options);
  await downloadWorkbook(
    workbook,
    fileName ?? `Person-Balance-${person.IdNumber}`
  );
};
