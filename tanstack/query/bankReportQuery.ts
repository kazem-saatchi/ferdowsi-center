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
    queryFn: async () => {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }
      // getBankTransactionsForReport is wrapped in handleServerAction, which
      // returns a {success, message, data} envelope. BankReportClient consumes
      // the plain row array, so unwrap it here.
      const response = await getBankTransactionsForReport(startDate, endDate);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: enabled && !!startDate && !!endDate, // Only run when dates are selected
  });
}

