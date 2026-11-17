import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { vazirFont64, vazirFontName } from "@/font/vazir-font";
import { formatNumber } from "./formatNumber";

// Extend the jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Column {
  header: string;
  accessor: string;
}

interface ExportOptions {
  fileName: string;
  columns: Column[];
  data: any[];
}

interface PdfExportOptions extends ExportOptions {
  /** Landscape fits a wide list (ten or more columns) on A4. */
  orientation?: "portrait" | "landscape";
  /** jspdf-autotable column styles by column index, merged over the default. */
  columnStyles?: Record<number, Record<string, unknown>>;
}

export const exportToPDF = ({
  fileName,
  columns,
  data,
  orientation = "portrait",
  columnStyles,
}: PdfExportOptions) => {
  // 1. Initialize jsPDF
  const doc = new jsPDF({
    orientation,
    unit: "mm",
  });

  // 2. Add the Persian font
  doc.addFileToVFS(`${vazirFontName}.ttf`, vazirFont64);
  doc.addFont(`${vazirFontName}.ttf`, vazirFontName, "normal");
  doc.setFont(vazirFontName);

  autoTable(doc, {
    head: [columns.map((column) => column.header)],
    body: data.map((row) =>
      columns.map((column) => {
        // Special formatting for balance/amount columns
        if (
          column.accessor.includes("balance") ||
          column.accessor.includes("amount") ||
          column.accessor.includes("totalAmount") ||
          column.accessor.includes("totalBalance") ||
          column.accessor.includes("ownerBalance") ||
          column.accessor.includes("renterBalance")
        ) {
          return formatNumber(row[column.accessor]);
        }
        return row[column.accessor];
      })
    ),
    styles: {
      font: vazirFontName,
      fontStyle: "normal",
      halign: "right", // Right align for RTL
    },
    headStyles: {
      font: vazirFontName,
      fontStyle: "bold",
      halign: "right",
      fillColor: [22, 160, 133], // Optional header color
    },
    bodyStyles: {
      font: vazirFontName,
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: "auto" }, // Adjust as needed
      ...columnStyles,
    },
  });
  doc.save(`${fileName}.pdf`);
};

export const exportToExcel = ({ fileName, columns, data }: ExportOptions) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((row) =>
      columns.reduce(
        (acc, column) => ({
          ...acc,
          [column.header]: row[column.accessor],
        }),
        {}
      )
    )
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// The balance-detail Excel report lives in utils/balanceDetailExcel.ts — it
// needs styling, borders and A4 page setup, which SheetJS CE cannot emit.
