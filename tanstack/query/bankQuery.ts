import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBankCardTransfer } from "@/app/api/actions/bank/getBankCardTransfer";
import { getBankTransactions } from "@/app/api/actions/bank/getBankTransactions";
import { AccountType } from "@prisma/client";
import { getBankFailedCardTransfer } from "@/app/api/actions/bank/getBankFailedCardTransfer";
import { getBankIncomeTransfer } from "@/app/api/actions/bank/getBankIncomeTransfer";

//------------------Bank--------------------

// Get All Card Transfer - Card To Card
export function useGetAllCardTransfer({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ["cardTransfer", page, limit],
    queryFn: async () => {
      // Explicitly create new object to avoid referential stability issues
      const result = await getBankCardTransfer({
        page: Number(page),
        limit: Number(limit),
      });
      console.log("API Response:", result);
      return result;
    },
    placeholderData: keepPreviousData,
  });
}

// Get All Bank Transactions
export function useGetAllBankTransactions({
  page,
  limit,
  sortBy,
  sortOrder,
  accountType,
  type,
}: {
  page: number;
  limit: number;
  sortBy: "senderAccount" | "date";
  sortOrder: "desc" | "asc";
  accountType?: AccountType;
  type?: "PAYMENT" | "INCOME";
}) {
  return useQuery({
    queryKey: ["bankTransactions", page, limit, accountType, type],
    // Query function: Calls the server action
    queryFn: () =>
      getBankTransactions({
        page,
        limit,
        sortBy,
        sortOrder,
        accountType,
        type,
      }),
    // Keep previous data while loading the next page for smoother pagination
    placeholderData: keepPreviousData,
  });
}

// Get All Failed Card Transfer - Card To Card
export function useGetAllFailedCardTransfer({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ["failedCardTransfer", page, limit],
    queryFn: async () => {
      // Explicitly create new object to avoid referential stability issues
      const result = await getBankFailedCardTransfer({
        page: Number(page),
        limit: Number(limit),
      });
      console.log("API Response:", result);
      return result;
    },
    placeholderData: keepPreviousData,
  });
}

// Get All Income Transfer - Exclude Card To Card
export function useGetAllIncomeTransfer({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ["incomeTransfer", page, limit],
    queryFn: async () => {
      // Explicitly create new object to avoid referential stability issues
      const result = await getBankIncomeTransfer({
        page: Number(page),
        limit: Number(limit),
      });
      console.log("API Response:", result);
      return result;
    },
    placeholderData: keepPreviousData,
  });
}