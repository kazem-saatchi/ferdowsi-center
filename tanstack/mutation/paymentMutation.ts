import addFailedPayment from "@/app/api/actions/payment/addFailedPayment";
import addPaymentByInfo from "@/app/api/actions/payment/addPayment";
import addPaymentByBankId from "@/app/api/actions/payment/addPaymentByBankId";
import addPaymentFromCard from "@/app/api/actions/payment/addPaymentFromCard";
import deletePaymentById from "@/app/api/actions/payment/deletePayment";
import updatePaymentUserAction, {
  UpdatePaymentUserProps,
} from "@/app/api/actions/payment/updatePaymentUser";
import {
  addPaymentByBankIdData,
  AddPaymentByInfoData,
} from "@/schema/paymentSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { successMSG } from "@/utils/messages";
import { BankTransaction } from "@prisma/client";

//------------------PAYMENT--------------------

// Shape returned by the cardTransfer / failedCardTransfer queries
type CardTransferResult = {
  data: BankTransaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Remove a single transaction from every cached cardTransfer page,
// so the table updates in place without a full server refetch.
function removeCardTransferRow(
  queryClient: ReturnType<typeof useQueryClient>,
  txId: string
) {
  queryClient.setQueriesData<CardTransferResult>(
    { queryKey: ["cardTransfer"] },
    (old) => {
      if (!old) return old;
      const data = old.data.filter((tx) => tx.id !== txId);
      if (data.length === old.data.length) return old;
      return { ...old, data, totalCount: Math.max(0, old.totalCount - 1) };
    }
  );
}

// add payment to a shop by shopId and personId
export function useAddPaymentByShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddPaymentByInfoData) =>
      await addPaymentByInfo(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", variables.personId],
        });

        toast.success(data.data?.message);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// add payment to a shop by Bank TransactionId
export function useAddPaymentByBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: addPaymentByBankIdData) =>
      await addPaymentByBankId(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", variables.personId],
        });

        toast.success(data.data?.message);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// delete a payment
export function useDeletePaymentById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => await deletePaymentById(paymentId),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", data?.data?.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", data?.data?.personId],
        });

        toast.success(data.data?.message);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAddPaymentFromCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await addPaymentFromCard(id),
    onSuccess: (data, id) => {
      if (data.data?.success) {
        // Partial update: drop just this row from the cached table
        removeCardTransferRow(queryClient, id);
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });
        toast.success(data.data?.message);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAddFailedPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await addFailedPayment(id),
    onSuccess: (data, id) => {
      if (data.data?.success) {
        // Partial update: drop just this row from the cached table
        removeCardTransferRow(queryClient, id);
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });
        toast.success(data.data?.message);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePaymentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePaymentUserProps) =>
      await updatePaymentUserAction(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["shop-balance", variables.shopId],
        });

        const payload = data.data as { message?: string } | undefined;
        toast.success(payload?.message ?? successMSG.paymentUpdated);
      } else {
        toast.error(data.data?.message || data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
