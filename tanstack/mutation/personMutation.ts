import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddPersonData } from "@/schema/personSchema"; 
import addPerson from "@/app/api/actions/person/addPerson";
import { UpdatePersonData } from "@/schema/personSchema";
import updatePersonInfo from "@/app/api/actions/person/updatePerson";
import { UpdatePersonRoleData } from "@/schema/personSchema";
import updatePersonRole from "@/app/api/actions/person/updatePersonRule";
import deletePersonById from "@/app/api/actions/person/deletePerson";
import { UpdatePersonPasswordData } from "@/schema/personSchema";
import updateUserPassword from "@/app/api/actions/user/updatePersonPassword";
import addPersonsFromFile from "@/app/api/actions/person/addPersonsFromFile";

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
  
  // Add Persons From File
  export function useAddPersonsFromFile() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: any) => await addPersonsFromFile(data),
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
      mutationFn: async (data: UpdatePersonData) => await updatePersonInfo(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          console.log("personId", data.data?.personId);
          queryClient.invalidateQueries({
            queryKey: ["person", data.data?.personId],
          });
          queryClient.refetchQueries({
            queryKey: ["person", data.data?.personId],
          });
  
          queryClient.invalidateQueries({
            queryKey: ["all-persons"],
          });
  
          queryClient.refetchQueries({
            queryKey: ["all-persons"],
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
  
  // Update Person Role
  export function useUpatePersonRole() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdatePersonRoleData) =>
        await updatePersonRole(data),
      onSuccess: (data, variables) => {
        if (data.success) {
          queryClient.invalidateQueries({
            queryKey: ["person", variables.userId],
          });
          queryClient.refetchQueries({
            queryKey: ["person", variables.userId],
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
  
  // Update User Password
  export function useUpdatePassword() {
    const queryClient = useQueryClient();
    const router = useRouter();
  
    return useMutation({
      mutationFn: async (data: UpdatePersonPasswordData) =>
        await updateUserPassword(data),
      onSuccess: (data, variables) => {
        if (data.success) {
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