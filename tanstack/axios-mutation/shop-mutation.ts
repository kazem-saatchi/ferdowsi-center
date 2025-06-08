import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShop,
  updateShopInfo,
  updateShopOwner,
  updateShopRenter,
  endShopRenter,
  updateShopStatus,
  deleteShop,
} from "@/server/modules/shops/shop-client";
import {
  AddShopData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  EndShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";
import { shopKeys } from "@/tanstack/axios-query/shop-query";

// Create shop mutation
export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddShopData) => createShop(data),
    onSuccess: () => {
      // Invalidate and refetch shop lists
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Create shop error:", error);
    },
  });
};

// Update shop info mutation
export const useUpdateShopInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdateShopInfoData, "id">;
    }) => updateShopInfo(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific shop and lists
      queryClient.invalidateQueries({
        queryKey: shopKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Update shop info error:", error);
    },
  });
};

// Update shop owner mutation
export const useUpdateShopOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopOwnerData) => updateShopOwner(data),
    onSuccess: (_, variables) => {
      // Invalidate specific shop and lists
      queryClient.invalidateQueries({
        queryKey: shopKeys.detail(variables.shopId),
      });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Update shop owner error:", error);
    },
  });
};

// Update shop renter mutation
export const useUpdateShopRenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopRenterData) => updateShopRenter(data),
    onSuccess: (_, variables) => {
      // Invalidate specific shop and lists
      queryClient.invalidateQueries({
        queryKey: shopKeys.detail(variables.shopId),
      });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Update shop renter error:", error);
    },
  });
};

// End shop renter mutation
export const useEndShopRenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EndShopRenterData) => endShopRenter(data),
    onSuccess: (_, variables) => {
      // Invalidate specific shop and lists
      queryClient.invalidateQueries({
        queryKey: shopKeys.detail(variables.shopId),
      });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("End shop renter error:", error);
    },
  });
};

// Update shop status mutation
export const useUpdateShopStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopStatusData) => updateShopStatus(data),
    onSuccess: (_, variables) => {
      // Invalidate specific shop and lists
      queryClient.invalidateQueries({
        queryKey: shopKeys.detail(variables.shopId),
      });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Update shop status error:", error);
    },
  });
};

// Delete shop mutation
export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShop(id),
    onSuccess: (_, id) => {
      // Remove specific shop from cache and invalidate lists
      queryClient.removeQueries({ queryKey: shopKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete shop error:", error);
    },
  });
};
