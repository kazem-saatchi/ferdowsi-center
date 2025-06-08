import { useQuery } from "@tanstack/react-query";
import findBalanceByPerson from "@/app/api/actions/balance/getPersonBalance";
import findBalanceByShop from "@/app/api/actions/balance/getShopBalance";
import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";

//------------------BALANCE--------------------
export function useGetAllShopsBalance(proprietor: boolean) {
  return useQuery({
    queryKey: ["all-balances", proprietor ? "yearly" : "monthly"],
    queryFn: async () => await findBalanceAllShops(proprietor),
  });
}

export function useGetShopBalance(shopId: string) {
  return useQuery({
    queryKey: ["shop-balance", shopId],
    queryFn: async () => await findBalanceByShop({ shopId }),
  });
}

export function useGetPersonBalance(personId: string) {
  return useQuery({
    queryKey: ["person-balance", personId],
    queryFn: async () => await findBalanceByPerson({ personId }),
  });
}
