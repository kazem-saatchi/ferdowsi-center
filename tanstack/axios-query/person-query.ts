import { useQuery } from "@tanstack/react-query";
import {
  getAllPersons,
  getPersonById,
  getPersonsByFilter,
  getPersonsByShop,
} from "@/server/modules/persons/person-client";
import { FindPersonByFilterData } from "@/schema/personSchema";

// Query keys
export const personKeys = {
  all: ["persons"] as const,
  lists: () => [...personKeys.all, "list"] as const,
  list: (filters?: FindPersonByFilterData) =>
    [...personKeys.lists(), { filters }] as const,
  details: () => [...personKeys.all, "detail"] as const,
  detail: (id: string) => [...personKeys.details(), id] as const,
  byShop: (shopId: string) => [...personKeys.all, "by-shop", shopId] as const,
};

// Get all persons
export const useGetAllPersons = () => {
  return useQuery({
    queryKey: personKeys.lists(),
    queryFn: getAllPersons,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get person by ID
export const useGetPersonById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: personKeys.detail(id),
    queryFn: () => getPersonById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get persons by filter
export const useGetPersonsByFilter = (
  filters: FindPersonByFilterData,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: personKeys.list(filters),
    queryFn: () => getPersonsByFilter(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get persons by shop
export const useGetPersonsByShop = (
  shopId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: personKeys.byShop(shopId),
    queryFn: () => getPersonsByShop(shopId),
    enabled: enabled && !!shopId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
