import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddShopData } from "@/schema/shopSchema";
import addShop from "@/app/api/actions/shop/addShop";
import { UpdateShopInfoData } from "@/schema/shopSchema";
import updateShopInfo from "@/app/api/actions/shop/updateShopInfo";
import { UpdateShopOwnerData } from "@/schema/shopSchema";
import updateShopOwnerId from "@/app/api/actions/shop/updateShopOwner";
import { UpdateShopRenterData } from "@/schema/shopSchema";
import updateShopRenterId from "@/app/api/actions/shop/updateShopRenter";
import { EndShopRenterData } from "@/schema/shopSchema";
import endShopRenterId from "@/app/api/actions/shop/endShopRenter";
import { UpdateShopStatusData } from "@/schema/shopSchema";
import updateShopStatus from "@/app/api/actions/shop/updateShopStatus";

//------------------SHOP--------------------

// Add Shop
export function useAddShop() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: AddShopData) => await addShop(data),
      onSuccess: (data) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
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
  
  // Update Shop Info
  export function useUpateShopInfo() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdateShopInfoData) => await updateShopInfo(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
          queryClient.invalidateQueries({ queryKey: ["shop", variables.id] });
          queryClient.refetchQueries({ queryKey: ["shop", variables.id] });
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
  
  // update shop owner
  export function useUpdateShopOwner() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdateShopOwnerData) =>
        await updateShopOwnerId(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
  
          queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
          queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });
  
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
  
  // update shop renter
  export function useUpdateShopRenter() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdateShopRenterData) =>
        await updateShopRenterId(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
  
          queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
          queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });
  
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
  
  // remove shop renter
  export function useEndShopRenter() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: EndShopRenterData) => await endShopRenterId(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
  
          queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
          queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });
  
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
  
  // activate/inactivate shop
  export function useUpdateShopStatus() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdateShopStatusData) =>
        await updateShopStatus(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["all-shops"] });
          queryClient.refetchQueries({ queryKey: ["all-shops"] });
  
          queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
          queryClient.refetchQueries({ queryKey: ["shop", variables.shopId] });
  
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