import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatNumber";
import { format } from "date-fns-jalali";

export interface BankTransaction {
  date: string;
  // time: string; // Keep as simple string
  description: string;
  transactionId: string;
  inputAmount: string;
  outputAmount: string;
  balanceAmount: string;
  branch: string;
}

export type BankDataHeaderLabels = {
  [key in keyof BankTransaction]: string;
};

interface PreviewTableProps {
  data: BankTransaction[];
}

export function BankPreviewTable({ data }: PreviewTableProps) {
  if (data.length === 0) return null;

  const headerLabels: BankDataHeaderLabels = {
    date: "تاریخ",
    // time: "ساعت",
    description: "توضیحات",
    transactionId: "کد گردش",
    inputAmount: "واریز",
    outputAmount: "برداشت",
    balanceAmount: "مانده",
    branch: "شعبه",
  };

  const headers = Object.keys(headerLabels) as Array<keyof BankTransaction>;

  return (
    <div className="overflow-x-auto">
      <div
        className={cn(
          "flex flex-row items-center justify-start",
          "max-w-72 p-2 gap-2",
          "border rounded-md"
        )}
      >
        <span>تعداد اطلاعات استخراج شده</span>
        {data.length}
        <span>ردیف</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className={cn("text-center text-xs")}>
                {headerLabels[header]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className={cn(
                parseFloat(row.inputAmount) === 0
                  ? "bg-red-600/20"
                  : "bg-green-600/20"
              )}
            >
              {headers.map((header) => (
                <TableCell key={header} className={cn("text-center text-xs")}>
                  {header === "date" &&
                    format(new Date(row[header]), "yyyy/MM/dd")}
                  {header === "description" && row[header]}
                  {header === "transactionId" && row[header]}
                  {header === "inputAmount" &&
                    formatNumber(parseInt(row[header]))}
                  {header === "outputAmount" &&
                    formatNumber(parseInt(row[header]))}
                  {header === "balanceAmount" &&
                    formatNumber(parseInt(row[header]))}
                  {header === "branch" && row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
