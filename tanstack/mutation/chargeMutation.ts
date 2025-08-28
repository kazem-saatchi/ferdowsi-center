import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import addChargeByShop from "@/app/api/actions/charge/addChargeByShop";
import addChargeByAmount from "@/app/api/actions/charge/addChargeByAmount";
import addChargeToAllShops from "@/app/api/actions/charge/addChargeToAllShops";
import generateShopChargeReferenceList from "@/app/api/actions/reference/shopChargeReference";
import generateAnnualShopChargeReferenceList from "@/app/api/actions/reference/shopAnnualChargeReference";
import {
  AddChargeByShopData,
  AddChargeByAmountData,
  AddChargeAllShopsData,
  ShopChargeReferenceData,
  ShopAnnualChargeReferenceData,
  AddRentAllKiosksData,
  AddChargeByAmountToShopListData,
} from "@/schema/chargeSchema";
import addRentToAllKiosks from "@/app/api/actions/charge/addRentAllKiosks";
import addChargeByAmountToShopList from "@/app/api/actions/charge/addChargeByAmountToShopList";

//------------------CHARGE--------------------

// add monthly charge to a shop
export function useAddChargeByShop() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddChargeByShopData) =>
      await addChargeByShop(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-charges"] });
        queryClient.refetchQueries({ queryKey: ["all-charges"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-charges", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-charges", variables.shopId],
        });

        // i can't refetch person-charges related to this add charge so invalidate all person
        queryClient.invalidateQueries({ queryKey: ["person-charges"] });

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

// add charge by amount and id
export function useAddChargeByAmount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddChargeByAmountData) =>
      await addChargeByAmount(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-charges"] });
        queryClient.refetchQueries({ queryKey: ["all-charges"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-charges", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-charges", variables.shopId],
        });

        // i can't refetch person-charges related to this add charge so invalidate all person
        queryClient.invalidateQueries({ queryKey: ["person-charges"] });

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

// add charge by amount to shop list
export function useAddChargeByAmountToShopList() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddChargeByAmountToShopListData) =>
      await addChargeByAmountToShopList(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-charges"] });
        queryClient.refetchQueries({ queryKey: ["all-charges"] });

        variables.shopIdList.forEach((shopId) => {
          queryClient.invalidateQueries({
            queryKey: ["shop-charges", shopId],
          });
          queryClient.refetchQueries({
            queryKey: ["shop-charges", shopId],
          });
        });

        // i can't refetch person-charges related to this add charge so invalidate all person
        queryClient.invalidateQueries({ queryKey: ["person-charges"] });

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

// add charge to all shop
export function useAddChargeAllShop() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddChargeAllShopsData) =>
      await addChargeToAllShops(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate queries related to all charges
        queryClient.invalidateQueries({ queryKey: ["all-charges"] });

        // Dynamically invalidate all shop-related charges
        queryClient.invalidateQueries({ queryKey: ["shop-charges"] });

        // Dynamically invalidate all person-related charges
        queryClient.invalidateQueries({ queryKey: ["person-charges"] });

        // refetch all charges list
        queryClient.refetchQueries({ queryKey: ["all-charges"] });

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

// Add rent to all kiosks
export function useAddRentAllKiosks() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddRentAllKiosksData) =>
      await addRentToAllKiosks(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate queries related to all charges
        queryClient.invalidateQueries({ queryKey: ["all-charges"] });

        // Dynamically invalidate all shop-related charges
        queryClient.invalidateQueries({ queryKey: ["shop-charges"] });

        // Dynamically invalidate all person-related charges
        queryClient.invalidateQueries({ queryKey: ["person-charges"] });

        // refetch all charges list
        queryClient.refetchQueries({ queryKey: ["all-charges"] });

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

// generate charge reference Monthly
export function useCreateChargeReference() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ShopChargeReferenceData) =>
      await generateShopChargeReferenceList(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-charges-reference"] });
        queryClient.refetchQueries({ queryKey: ["all-charges-reference"] });

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

// generate charge reference Yearly
export function useCreateAnnualChargeReference() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ShopAnnualChargeReferenceData) =>
      await generateAnnualShopChargeReferenceList(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-charges-reference"] });
        queryClient.refetchQueries({ queryKey: ["all-charges-reference"] });

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
