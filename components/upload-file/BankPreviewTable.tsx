import { formatJalaliDate } from "@/utils/localeDate";
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
import { BankTransactionData } from "./readFile";

// export interface BankTransaction {
//   date: string;
//   // time: string; // Keep as simple string
//   description: string;
//   transactionId: string;
//   inputAmount: string;
//   outputAmount: string;
//   balanceAmount: string;
//   branch: string;
// }

export type BankDataHeaderLabels = {
  [key in keyof BankTransactionData]: string;
};

interface PreviewTableProps {
  data: BankTransactionData[];
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

  const headers = Object.keys(headerLabels) as Array<keyof BankTransactionData>;


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
            <TableRow key={index}>
              {headers.map((header, col) => (
                <TableCell
                  key={header}
                  className={cn(
                    "text-center text-xs",
                    // Leading-edge bar: green for money in, red for money out.
                    col === 0 && "border-s-4",
                    col === 0 &&
                      (row.inputAmount === 0
                        ? "border-s-red-500"
                        : "border-s-emerald-500")
                  )}
                >
                  {header === "date" &&
                    formatJalaliDate(row[header])}
                  {header === "description" && row[header]}
                  {header === "transactionId" && row[header]}
                  {header === "inputAmount" && formatNumber(row[header])}
                  {header === "outputAmount" && formatNumber(row[header])}
                  {header === "balanceAmount" && formatNumber(row[header])}
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
