import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
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

export const exportToPDF = ({ fileName, columns, data }: ExportOptions) => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [columns.map(column => column.header)],
    body: data.map(row => columns.map(column => row[column.accessor])),
  });
  doc.save(`${fileName}.pdf`);
};

export const exportToExcel = ({ fileName, columns, data }: ExportOptions) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(row => 
      columns.reduce((acc, column) => ({
        ...acc,
        [column.header]: row[column.accessor]
      }), {})
    )
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

