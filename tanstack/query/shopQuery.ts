import findAllShops from "@/app/api/actions/shop/allShops";
import { useQuery } from "@tanstack/react-query";
import findShopById from "@/app/api/actions/shop/findShopById";

//------------------SHOP--------------------
export function useFindAllShops() {
  return useQuery({
    queryKey: ["all-shops"],
    queryFn: async () => await findAllShops(),
  });
}

export function useFindShopById(id: string) {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: async () => await findShopById(id),
  });
}
