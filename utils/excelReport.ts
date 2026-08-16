// Shared building blocks for the printable Excel reports (utils/*Excel.ts).
//
// Every report prints on the same black-and-white laser printer and on the same
// A4 sheet, so the page setup, the greyscale palette and the border/banner
// helpers live here rather than being copied per report.
//
// ExcelJS itself is imported lazily by loadWorkbookCtor — a static import would
// add ~900 kB to the first load of every page that merely *offers* a download.
import type { Borders, Row, Workbook, Worksheet } from "exceljs";

export const FONT = "Tahoma";

/** Thousands separator, no symbol, no decimals — negatives keep a plain minus. */
export const CURRENCY_FORMAT = "#,##0;-#,##0";

/** Greyscale only: structure is carried by borders, weight and light grey bands
 *  rather than by hue, so nothing is lost on a mono printer. */
export const GREY = {
  title: "FFD9D9D9",
  band: "FFE6E6E6",
  soft: "FFF2F2F2",
  faint: "FFF7F7F7",
  border: "FF7F7F7F",
} as const;

export const THIN_BORDER: Partial<Borders> = {
  top: { style: "thin", color: { argb: GREY.border } },
  left: { style: "thin", color: { argb: GREY.border } },
  bottom: { style: "thin", color: { argb: GREY.border } },
  right: { style: "thin", color: { argb: GREY.border } },
};

/** A heavier rule for grand totals — greyscale fills alone are too close in
 *  tone to separate them from the per-section totals in print. */
export const STRONG_BORDER: Partial<Borders> = {
  ...THIN_BORDER,
  top: { style: "medium", color: { argb: "FF000000" } },
  bottom: { style: "medium", color: { argb: "FF000000" } },
};

export function borderRow(row: Row, lastCol: number, style = THIN_BORDER) {
  for (let col = 1; col <= lastCol; col++) {
    row.getCell(col).border = style;
  }
}

/** No-op when no colour is given, so callers can pass an optional tint. */
export function fillRow(row: Row, lastCol: number, argb?: string) {
  if (!argb) return;
  for (let col = 1; col <= lastCol; col++) {
    row.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb },
    };
  }
}

export interface BannerOptions {
  height: number;
  size: number;
  bold?: boolean;
  italic?: boolean;
  fillColor?: string;
  wrap?: boolean;
}

/** Adds a row merged across the full sheet width and returns it. */
export function addBanner(
  sheet: Worksheet,
  lastCol: number,
  text: string,
  opts: BannerOptions
): Row {
  const row = sheet.addRow([text]);
  sheet.mergeCells(row.number, 1, row.number, lastCol);
  row.height = opts.height;
  row.getCell(1).font = {
    name: FONT,
    size: opts.size,
    bold: opts.bold ?? true,
    italic: opts.italic ?? false,
  };
  row.getCell(1).alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: opts.wrap ?? false,
    readingOrder: "rtl",
  };
  fillRow(row, lastCol, opts.fillColor);
  borderRow(row, lastCol);
  return row;
}

type WorkbookCtor = new () => Workbook;

/** exceljs is CommonJS: Node exposes it only under `default`, webpack under
 *  both. Resolve whichever is present. */
export async function loadWorkbookCtor(): Promise<WorkbookCtor> {
  const mod = (await import("exceljs")) as unknown as {
    default?: { Workbook?: WorkbookCtor };
    Workbook?: WorkbookCtor;
  };
  const ctor = mod.default?.Workbook ?? mod.Workbook;
  if (!ctor) throw new Error("Failed to load exceljs");
  return ctor;
}

/** A4 with narrow margins, RTL, scaled to exactly one page wide. */
export async function createReportSheet(
  sheetName: string,
  orientation: "portrait" | "landscape" = "portrait"
): Promise<{ workbook: Workbook; sheet: Worksheet }> {
  const Workbook = await loadWorkbookCtor();
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: true, showGridLines: false }],
    pageSetup: {
      paperSize: 9, // A4
      orientation,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0, // as many pages tall as it needs
      horizontalCentered: true,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.35,
        bottom: 0.35,
        header: 0.2,
        footer: 0.2,
      },
    },
  });
  return { workbook, sheet };
}

export async function downloadWorkbook(workbook: Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
