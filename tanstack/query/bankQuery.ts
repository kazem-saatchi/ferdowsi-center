import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBankCardTransfer } from "@/app/api/actions/bank/getBankCardTransfer";
import { getBankTransactions } from "@/app/api/actions/bank/getBankTransactions";
import {
  BankTransactionFilters,
  BankTransactionSortField,
} from "@/utils/bankTransactionFilters";
import { getBankFailedCardTransfer } from "@/app/api/actions/bank/getBankFailedCardTransfer";
import { getBankIncomeTransfer } from "@/app/api/actions/bank/getBankIncomeTransfer";
import { getTransactionData } from "@/app/api/actions/bank/getTransactionData";

//------------------Bank--------------------

// The bank readers are wrapped in handleServerAction, which returns a
// {success, message, data} envelope. The pages below consume the raw paginated
// result, so the envelope is unwrapped here and a failure is turned into a
// rejected query.
function unwrap<T>(response: {
  success: boolean;
  message: string;
  data?: T;
}): T {
  if (!response.success || !response.data) {
    throw new Error(response.message);
  }
  return response.data;
}

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
      return unwrap(
        await getBankCardTransfer({
          page: Number(page),
          limit: Number(limit),
        })
      );
    },
    placeholderData: keepPreviousData,
  });
}

// Get All Bank Transactions
export type UseBankTransactionsArgs = BankTransactionFilters & {
  page: number;
  limit: number;
  sortBy?: BankTransactionSortField;
  sortOrder?: "desc" | "asc";
};

export function useGetAllBankTransactions(args: UseBankTransactionsArgs) {
  return useQuery({
    // The whole argument object is the key. It used to be a hand-written list
    // that had already fallen behind — sortBy and sortOrder were missing, so
    // any change to them would have served stale rows from cache. Hashing the
    // object means a filter can never be left out of the key again.
    queryKey: ["bankTransactions", args],
    // Query function: Calls the server action
    queryFn: async () => unwrap(await getBankTransactions(args)),
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
      return unwrap(
        await getBankFailedCardTransfer({
          page: Number(page),
          limit: Number(limit),
        })
      );
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
      return unwrap(
        await getBankIncomeTransfer({
          page: Number(page),
          limit: Number(limit),
        })
      );
    },
    placeholderData: keepPreviousData,
  });
}

// Get Transaction Data
export function useGetTransactionData(bankTransactionId: string) {
  return useQuery({
    queryKey: ["transactionData", bankTransactionId],
    queryFn: () => getTransactionData(bankTransactionId),
    enabled: !!bankTransactionId,
  });
}
