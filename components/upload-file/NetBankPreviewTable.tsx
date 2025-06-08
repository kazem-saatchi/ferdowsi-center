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
import { NetBankTransactionData } from "./readFile";

export type BankDataHeaderLabels = {
  [key in keyof NetBankTransactionData]: string;
};

interface PreviewTableProps {
  data: NetBankTransactionData[];
}

export function NetBankPreviewTable({ data }: PreviewTableProps) {
  if (data.length === 0) return null;

  const headerLabels: BankDataHeaderLabels = {
    branch: "کد شعبه",
    date: "تاریخ",
    transactionId: "سند",
    bankRecieptId: "شماره قبض",
    chequeNumber: "شماره چک",
    description: "توضیحات",
    inputAmount: "واریز",
    outputAmount: "برداشت",
    balanceAmount: "مانده",
  };

  const headers = Object.keys(headerLabels) as Array<
    keyof NetBankTransactionData
  >;

  const filteredHeaders = headers.filter(
    (header) => header !== "bankRecieptId"
  );


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
            {filteredHeaders.map((header) => (
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
                row.inputAmount === 0 ? "bg-red-600/20" : "bg-green-600/20"
              )}
            >
              {filteredHeaders.map((header) => (
                <TableCell key={header} className={cn("text-center text-xs max-w-96")}>
                  {header === "date" &&
                    format(new Date(row[header]), "yyyy/MM/dd")}
                  {header === "branch" && row[header]}
                  {header === "transactionId" && row[header]}
                  {header === "chequeNumber" && String(row[header])}
                  {header === "description" && row[header]}
                  {header === "inputAmount" && formatNumber(row[header])}
                  {header === "outputAmount" && formatNumber(row[header])}
                  {header === "balanceAmount" && formatNumber(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
