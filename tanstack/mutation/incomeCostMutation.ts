import setRegisterAbleAction from "@/app/api/actions/bank/setRegisterAbleAction";
import addCost from "@/app/api/actions/cost-income/addCost";
import addCostFromBank from "@/app/api/actions/cost-income/addCostFromBank";
import addIncome from "@/app/api/actions/cost-income/addIncome";
import {
  AddCostData,
  AddCostFromBankData,
  AddIncomeData,
} from "@/schema/cost-IncomeSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

//------------------COST-INCOME--------------------

// add cost
export function useAddCost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddCostData) => await addCost(data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-costs"] });
        queryClient.refetchQueries({ queryKey: ["all-costs"] });
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

// Add Cost From Bank Transactions
export function useAddCostFromBank() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddCostFromBankData) =>
      await addCostFromBank(data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-costs"] });
        queryClient.refetchQueries({ queryKey: ["all-costs"] });
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

// add income
export function useAddIncome() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddIncomeData) => await addIncome(data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-incomes"] });
        queryClient.refetchQueries({ queryKey: ["all-incomes"] });
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

// set a Transaction as Registerable

export function useSetRegisterAble() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await setRegisterAbleAction(id),
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
