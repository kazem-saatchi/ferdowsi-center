import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { vazirFont64, vazirFontName } from "@/font/vazir-font";
import { formatNumber } from "./formatNumber";
import { formatPersianDate } from "./localeDate";
import { Charge, Payment } from "@prisma/client";
import { labels } from "./label";

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

interface BalanceDetailExportData {
  charges: Charge[];
  payments: Payment[];
}

// Helper function to prepare balance detail data for export
const prepareBalanceDetailData = ({
  charges,
  payments,
}: BalanceDetailExportData) => {
  const balanceData = [
    ...charges.map((charge) => ({
      ...charge,
      type: "charge",
      typeLabel: labels.charge,
    })),
    ...payments.map((payment) => ({
      ...payment,
      type: "payment",
      typeLabel: labels.payment,
    })),
  ].sort((a, b) => {
    const dateA = a.date?.getTime() || 0;
    const dateB = b.date?.getTime() || 0;
    return dateB - dateA; // newest first
  });

  // Calculate totals
  const totalChargeBalance = {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => {
        return item.type === "charge" ? sum + item.amount : sum - item.amount;
      }, 0),
  };

  const totalProprietorBalance = {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .filter((item) => item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .filter((item) => item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData
      .filter((item) => item.proprietor)
      .reduce((sum, item) => {
        return item.type === "charge" ? sum + item.amount : sum - item.amount;
      }, 0),
  };

  return {
    balanceData,
    totalChargeBalance,
    totalProprietorBalance,
  };
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

export const exportBalanceDetailToPDF = (
  { charges, payments }: BalanceDetailExportData,
  fileName: string = "Balance-Detail-Report"
) => {
  const { balanceData, totalChargeBalance, totalProprietorBalance } =
    prepareBalanceDetailData({ charges, payments });

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
  });

  // Add the Persian font
  doc.addFileToVFS(`${vazirFontName}.ttf`, vazirFont64);
  doc.addFont(`${vazirFontName}.ttf`, vazirFontName, "normal");
  doc.setFont(vazirFontName);

  // Prepare table data
  const tableData = balanceData.map((item) => [
    item.typeLabel,
    item.title,
    item.personName,
    formatPersianDate(item.date),
    formatNumber(item.amount),
    item.description || "",
  ]);

  // Add footer rows
  const footerData = [
    [
      "",
      "",
      "",
      labels.totalChargeBalance,
      formatNumber(totalChargeBalance.balance),
      "",
    ],
    [
      "",
      "",
      "",
      labels.totalProprietorBalance,
      formatNumber(totalProprietorBalance.balance),
      "",
    ],
  ];

  autoTable(doc, {
    head: [
      [
        labels.type,
        labels.title,
        labels.name,
        labels.date,
        labels.amount,
        labels.transactionInfo,
      ],
    ],
    body: [...tableData, ...footerData],
    styles: {
      font: vazirFontName,
      fontStyle: "normal",
      halign: "right",
      fontSize: 8,
    },
    headStyles: {
      font: vazirFontName,
      fontStyle: "bold",
      halign: "right",
      fillColor: [52, 73, 94],
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      font: vazirFontName,
      halign: "right",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    // Highlight footer rows
    didParseCell: (data) => {
      if (
        data.row.index >= tableData.length &&
        data.row.index < tableData.length + footerData.length
      ) {
        if (data.column.index === 3 || data.column.index === 4) {
          data.cell.styles.fillColor = [52, 152, 219];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  doc.save(`${fileName}.pdf`);
};

export const exportBalanceDetailToExcel = (
  { charges, payments }: BalanceDetailExportData,
  fileName: string = "Balance-Detail-Report"
) => {
  const { balanceData, totalChargeBalance, totalProprietorBalance } =
    prepareBalanceDetailData({ charges, payments });

  // Prepare Excel data
  const excelData = [
    // Header row
    [
      labels.type,
      labels.title,
      labels.name,
      labels.date,
      labels.amount,
      labels.transactionInfo,
    ],

    // Data rows
    ...balanceData.map((item) => [
      item.typeLabel,
      item.title,
      item.personName,
      formatPersianDate(item.date),
      item.amount,
      item.description || "",
    ]),

    // Empty row for separation
    ["", "", "", "", "", ""],

    // Footer rows
    ["", "", "", labels.totalChargeBalance, totalChargeBalance.balance, ""],
    [
      "",
      "",
      "",
      labels.totalProprietorBalance,
      totalProprietorBalance.balance,
      "",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 10 }, // Type
    { wch: 20 }, // Title
    { wch: 15 }, // Name
    { wch: 15 }, // Date
    { wch: 15 }, // Amount
    { wch: 30 }, // Description
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Balance Detail");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
