import { useQuery } from "@tanstack/react-query";
import { getAllShops, getShopById } from "@/server/modules/shops/shop-client";

// Query keys
export const shopKeys = {
  all: ["shops"] as const,
  lists: () => [...shopKeys.all, "list"] as const,
  list: (filters?: any) => [...shopKeys.lists(), { filters }] as const,
  details: () => [...shopKeys.all, "detail"] as const,
  detail: (id: string) => [...shopKeys.details(), id] as const,
};

// Get all shops
export const useGetAllShops = () => {
  return useQuery({
    queryKey: shopKeys.lists(),
    queryFn: getAllShops,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get shop by ID
export const useGetShopById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: shopKeys.detail(id),
    queryFn: () => getShopById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
