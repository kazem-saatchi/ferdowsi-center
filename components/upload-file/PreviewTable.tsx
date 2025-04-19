import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PreviewTableProps {
  data: any[];
}

export function PreviewTable({ data }: PreviewTableProps) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className={cn("text-center text-xs")}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  className={cn(
                    "text-center text-xs",
                    row[header]===undefined && "bg-red-500 text-white",
                    row[header]===0 && "bg-yellow-300 text-white",
                  )}
                >
                  {row[header] !== undefined ? row[header] : "Empty"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
