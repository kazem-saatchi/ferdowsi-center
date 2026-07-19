import { AddShopHistoryData } from "@/schema/shopSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import addShopHistory from "@/app/api/actions/history/addShopHistory";
import { UpdateHistoryData } from "@/app/api/actions/history/updateHistory";
import updateHistoryAction from "@/app/api/actions/history/updateHistory";
import previewHistoryDateChangeAction from "@/app/api/actions/history/previewHistoryDateChange";

//------------------HISTORY--------------------

// ADD SHOP HISTORY
export function useAddShopHistory() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (historyData: AddShopHistoryData) =>
        await addShopHistory(historyData),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-histories"] });
          queryClient.refetchQueries({ queryKey: ["all-histories"] });
  
          queryClient.invalidateQueries({
            queryKey: ["shop-history", variables.shopId],
          });
          queryClient.refetchQueries({
            queryKey: ["shop-history", variables.shopId],
          });
  
          queryClient.invalidateQueries({
            queryKey: ["person-history", variables.personId],
          });
          queryClient.refetchQueries({
            queryKey: ["person-history", variables.personId],
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


  // PREVIEW HISTORY DATE CHANGE (charge recalculation preview, no writes)

  export function usePreviewHistoryDateChange() {
    return useMutation({
      mutationFn: async (data: UpdateHistoryData) =>
        await previewHistoryDateChangeAction(data),
    });
  }

  // UPDATE SHOP HISTORY

  export function useUpdateShopHistory() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (data: UpdateHistoryData) => await updateHistoryAction(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-histories"] });
          queryClient.refetchQueries({ queryKey: ["all-histories"] });

          queryClient.invalidateQueries({ queryKey: ["shop-history", variables.shopId] });
          queryClient.refetchQueries({ queryKey: ["shop-history", variables.shopId] });

          queryClient.invalidateQueries({ queryKey: ["person-history", variables.personId] });
          queryClient.refetchQueries({ queryKey: ["person-history", variables.personId] });

          // Charges may have been re-split between owner/renter — refresh
          // every charge and balance view so amounts stay consistent.
          queryClient.invalidateQueries({ queryKey: ["all-charges"] });
          queryClient.invalidateQueries({ queryKey: ["shop-charges", variables.shopId] });
          queryClient.invalidateQueries({ queryKey: ["person-charges", variables.personId] });
          queryClient.invalidateQueries({ queryKey: ["all-balances"] });
          queryClient.invalidateQueries({ queryKey: ["shop-balance", variables.shopId] });
          queryClient.invalidateQueries({ queryKey: ["person-balance", variables.personId] });
          queryClient.invalidateQueries({ queryKey: ["all-rent-balance"] });

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