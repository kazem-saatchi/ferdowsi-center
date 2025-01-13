"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AddPersonData, updatePersonData } from "@/schema/userSchemas";
import addPerson from "@/app/api/actions/person/addPerson";
import { toast } from "sonner";
import updatePersonInfo from "@/app/api/actions/person/updatePerson";
import deletePersonById from "@/app/api/actions/person/deletePerson";
import {
  AddShopData,
  AddShopHistoryData,
  EndShopRenterData,
  UpdateShopInfoData,
  UpdateShopOwnerData,
  UpdateShopRenterData,
  UpdateShopStatusData,
} from "@/schema/shopSchema";
import addShop from "@/app/api/actions/shop/addShop";
import updateShopInfo from "@/app/api/actions/shop/updateShopInfo";
import addShopHistory from "@/app/api/actions/history/addShopHistory";
import updateShopOwnerId from "@/app/api/actions/shop/updateShopOwner";
import updateShopRenterId from "@/app/api/actions/shop/updateShopRenter";
import endShopRenterId from "@/app/api/actions/shop/endShopRenter";
import updateShopStatus from "@/app/api/actions/shop/updateShopStatus";
import {
  AddChargeAllShopsData,
  AddChargeByAmount,
  AddChargeByShopData,
  ShopChargeReferenceData,
} from "@/schema/chargeSchema";
import addChargeByShop from "@/app/api/actions/charge/addChargeByShop";
import addChargeToAllShops from "@/app/api/actions/charge/addChargeAllShops";
import generateShopChargeReferenceList from "@/app/api/actions/charge/shopChargeReference";
import { AddPaymentByInfoData } from "@/schema/paymentSchema";
import addPaymentByInfo from "@/app/api/actions/payment/addPayment";
import deletePaymentById from "@/app/api/actions/payment/deletePayment";
import addChargeByAmount from "@/app/api/actions/charge/addChargeByAmount";

//------------------PERSON--------------------

// Add Person
export function useAddPerson() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddPersonData) => await addPerson(data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-persons"] });
        queryClient.refetchQueries({ queryKey: ["all-persons"] });
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

// Update Person
export function useUpatePerson() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: updatePersonData) => await updatePersonInfo(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["person", variables.IdNumber],
        });
        queryClient.refetchQueries({
          queryKey: ["person", variables.IdNumber],
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

// Delete Person
export function useDeletePerson() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => await deletePersonById(id),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-persons"] });
        queryClient.refetchQueries({ queryKey: ["all-persons"] });
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

//------------------HISTORY--------------------

// add history
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
    mutationFn: async (data: AddChargeByAmount) =>
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

// generate charge reference
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

//------------------PAYMENT--------------------

// add paymentto a shop
export function useAddPaymentByShop() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: AddPaymentByInfoData) =>
      await addPaymentByInfo(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", variables.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", variables.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", variables.personId],
        });
        queryClient.refetchQueries({
          queryKey: ["person-payments", variables.personId],
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

// delete a payment
export function useDeletePaymentById() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (paymentId: string) => await deletePaymentById(paymentId),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-payments"] });
        queryClient.refetchQueries({ queryKey: ["all-payments"] });

        queryClient.invalidateQueries({
          queryKey: ["shop-payments", data?.data?.shopId],
        });
        queryClient.refetchQueries({
          queryKey: ["shop-payments", data?.data?.shopId],
        });

        queryClient.invalidateQueries({
          queryKey: ["person-payments", data?.data?.personId],
        });
        queryClient.refetchQueries({
          queryKey: ["person-payments", data?.data?.personId],
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
