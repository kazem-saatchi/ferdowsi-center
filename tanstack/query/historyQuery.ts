import findAllShopHistory from "@/app/api/actions/history/getAllHistory";
import findHistoryByPerson from "@/app/api/actions/history/getHistoryByPerson";
import findHistoryByShop from "@/app/api/actions/history/getHistoryByShop";
import { useQuery } from "@tanstack/react-query";

//------------------HISTORY--------------------
export function useShopHistoryAll() {
  return useQuery({
    queryKey: ["all-histories"],
    queryFn: async () => await findAllShopHistory(),
  });
}

export function useShopHistoryByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-history", shopId],
    queryFn: async () => await findHistoryByShop(shopId),
  });
}

export function useShopHistoryByPerson(personId: string) {
  return useQuery({
    queryKey: ["person-history", personId],
    queryFn: async () => await findHistoryByPerson(personId),
  });
}
