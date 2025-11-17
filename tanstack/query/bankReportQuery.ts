import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBankTransactionsForReport } from "@/app/api/actions/reports/getBankTransactionsForReport";

export function useGetBankReportTransactions({
  startDate,
  endDate,
  enabled = true,
}: {
  startDate: Date | null;
  endDate: Date | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "bankReport",
      startDate?.toISOString() || "",
      endDate?.toISOString() || "",
    ],
    queryFn: () => {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }
      return getBankTransactionsForReport(startDate, endDate);
    },
    placeholderData: keepPreviousData,
    enabled: enabled && !!startDate && !!endDate, // Only run when dates are selected
  });
}

