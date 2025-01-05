import { Button } from "@/components/ui/button";
import { exportToPDF, exportToExcel } from '@/utils/tableExport';

interface TableExportButtonsProps {
  fileName: string;
  columns: { header: string; accessor: string }[];
  data: any[];
}

export const TableExportButtons: React.FC<TableExportButtonsProps> = ({ fileName, columns, data }) => {
  const handleExportPDF = () => {
    exportToPDF({ fileName, columns, data });
  };

  const handleExportExcel = () => {
    exportToExcel({ fileName, columns, data });
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleExportPDF}>Export to PDF</Button>
      <Button onClick={handleExportExcel}>Export to Excel</Button>
    </div>
  );
};

