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

//------------------PAYMENT--------------------

// add payment to a shop by shopId and personId
export function useAddPaymentByShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddPaymentByInfoData) =>
      await addPaymentByInfo(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", variables.personId],
        });
        queryClient.refetchQueries({
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
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", variables.personId],
        });
        queryClient.refetchQueries({
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
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", data?.data?.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", data?.data?.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", data?.data?.personId],
        });
        queryClient.refetchQueries({
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
    onSuccess: (data) => {
      if (data.data?.success) {
        // queryClient.invalidateQueries({
        //   queryKey: ["cardTransfer"],
        //   refetchType: "active",
        // });
        // queryClient.refetchQueries({
        //   queryKey: ["cardTransfer"],
        //   refetchType: "active",
        // });
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
    onSuccess: (data) => {
      if (data.data?.success) {
        // queryClient.invalidateQueries({
        //   queryKey: ["cardTransfer"],
        //   refetchType: "active",
        // });
        // queryClient.refetchQueries({
        //   queryKey: ["cardTransfer"],
        //   refetchType: "active",
        // });
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
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", variables.shopId],
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
