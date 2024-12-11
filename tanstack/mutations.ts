"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AddPersonData, updatePersonData } from "@/schema/userSchemas";
import addPerson from "@/app/api/actions/person/addPerson";
import { toast } from "sonner";
import updatePersonInfo from "@/app/api/actions/person/updatePerson";
import deletePersonById from "@/app/api/actions/person/deletePerson";
import { AddShopData } from "@/schema/shopSchema";
import addShop from "@/app/api/actions/shop/addShop";

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
      onSuccess: (data,variables) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["person",variables.IdNumber] });
          queryClient.refetchQueries({ queryKey: ["person",variables.IdNumber] });
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
      onSuccess: (data,variables) => {
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

