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

// Format numbers with thousand separators and handle negatives
const formatBalance = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const absoluteValue = Math.abs(num);
  const formatted = absoluteValue.toLocaleString("en-US");
  return num < 0
    ? `بدهکار ${formatted}`
    : num == 0
    ? "تسویه"
    : `بستانکار ${formatted}`; // Or use color
};

export const exportToPDF = ({ fileName, columns, data }: ExportOptions) => {
  // 1. Initialize jsPDF
  const doc = new jsPDF({
    orientation: "portrait",
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
          column.accessor.includes("totalAmount")
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
