import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPerson,
  updatePerson,
  updatePersonRole,
  updatePersonPassword,
  deletePerson,
} from "@/server/modules/persons/person-client";
import {
  AddPersonData,
  UpdatePersonData,
  UpdatePersonRoleData,
  UpdatePersonPasswordData,
} from "@/schema/personSchema";
import { personKeys } from "@/tanstack/axios-query/person-query";

// Create person mutation
export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddPersonData) => createPerson(data),
    onSuccess: () => {
      // Invalidate and refetch person lists
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
    onError: (error) => {
      console.error("Create person error:", error);
    },
  });
};

// Update person mutation
export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdatePersonData, "id">;
    }) => updatePerson(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific person and lists
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
    onError: (error) => {
      console.error("Update person error:", error);
    },
  });
};

// Update person role mutation
export const useUpdatePersonRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdatePersonRoleData, "userId">;
    }) => updatePersonRole(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific person and lists
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
    onError: (error) => {
      console.error("Update person role error:", error);
    },
  });
};

// Update person password mutation
export const useUpdatePersonPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdatePersonPasswordData, "userId">;
    }) => updatePersonPassword(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific person
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Update person password error:", error);
    },
  });
};

// Delete person mutation
export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: (_, id) => {
      // Remove specific person from cache and invalidate lists
      queryClient.removeQueries({ queryKey: personKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete person error:", error);
    },
  });
};
