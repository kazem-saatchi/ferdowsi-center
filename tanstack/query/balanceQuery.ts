import { useQuery } from "@tanstack/react-query";
import findBalanceByPerson from "@/app/api/actions/balance/getPersonBalance";
import findBalanceByShop from "@/app/api/actions/balance/getShopBalance";
import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";
import findRentBalanceAllShops from "@/app/api/actions/balance/getAllRentsBalance";

//------------------BALANCE--------------------
export function useGetAllShopsBalance(proprietor: boolean) {
  return useQuery({
    queryKey: ["all-balances", proprietor ? "yearly" : "monthly"],
    queryFn: async () => await findBalanceAllShops(proprietor),
  });
}

export function useGetAllShopsBalanceChunked(
  proprietor: boolean,
  skip: number,
  take: number
) {
  return useQuery({
    queryKey: [
      "all-balances-chunked",
      proprietor ? "yearly" : "monthly",
      skip,
      take,
    ],
    queryFn: async () => await findBalanceAllShops(proprietor, skip, take),
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

export function useGetAllRentsBalance() {
  return useQuery({
    queryKey: ["all-rent-balance"],
    queryFn: async () => await findRentBalanceAllShops(),
  });
}
