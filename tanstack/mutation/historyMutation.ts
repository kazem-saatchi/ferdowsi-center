import { AddShopHistoryData } from "@/schema/shopSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import addShopHistory from "@/app/api/actions/history/addShopHistory";

//------------------HISTORY--------------------

// ADD SHOP HISTORY
export function useAddShopHistory() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
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