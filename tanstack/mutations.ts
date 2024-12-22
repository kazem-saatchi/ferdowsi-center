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

export function useAddShopHistory() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (historyData: AddShopHistoryData) =>
      await addShopHistory(historyData),
    onSuccess: (data, variables) => {
      if (data.success) {
        // queryClient.invalidateQueries({ queryKey: ["all-shops"] });
        // queryClient.refetchQueries({ queryKey: ["all-shops"] });

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

        queryClient.invalidateQueries({ queryKey: ["shop",variables.shopId] });
        queryClient.refetchQueries({ queryKey: ["shop",variables.shopId] });

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

        queryClient.invalidateQueries({ queryKey: ["shop",variables.shopId] });
        queryClient.refetchQueries({ queryKey: ["shop",variables.shopId] });

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

export function useEndShopRenter() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: EndShopRenterData) =>
      await endShopRenterId(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-shops"] });
        queryClient.refetchQueries({ queryKey: ["all-shops"] });

        queryClient.invalidateQueries({ queryKey: ["shop",variables.shopId] });
        queryClient.refetchQueries({ queryKey: ["shop",variables.shopId] });

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

        queryClient.invalidateQueries({ queryKey: ["shop",variables.shopId] });
        queryClient.refetchQueries({ queryKey: ["shop",variables.shopId] });

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
