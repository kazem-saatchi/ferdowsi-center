import findPersonAll from "@/app/api/actions/person/findPersonAll";
import findPersonById from "@/app/api/actions/person/findPersonById";
import findPersonByShop from "@/app/api/actions/person/findPersonByShop";
import findAllShopsByPerson from "@/app/api/actions/user/findAllShopsByPerson";
import findUserQuickState from "@/app/api/actions/user/getUserQuickState";
import { verifyToken } from "@/utils/auth";
import { useQuery } from "@tanstack/react-query";

//------------------PERSON--------------------
export function useFindPersonById(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => await findPersonById(id),
  });
}

export function useFindAllPersons() {
  return useQuery({
    queryKey: ["all-persons"],
    queryFn: async () => await findPersonAll(),
  });
}
export function usePersonsByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-persons", shopId],
    queryFn: async () => await findPersonByShop(shopId),
  });
}

export function useFindPersonFromSession() {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async () => await verifyToken(),
  });
}

//------------------USER--------------------

export function useGetAllShopsByPerson() {
    return useQuery({
      queryKey: ["person-Shops"],
      queryFn: async () => await findAllShopsByPerson(),
    });
  }
  
  export function useGetUserInfo() {
    return useQuery({
      queryKey: ["user-info"],
      queryFn: async () => await verifyToken(),
    });
  }
  
  export function useGetUserQuickState() {
    return useQuery({
      queryKey: ["user-quick-state"],
      queryFn: async () => {
        // First get user info
        const userData = await verifyToken();
  
        if (!userData.person?.id) {
          throw new Error("User not properly authenticated");
        }
  
        // Then fetch quick state data
        const quickState = await findUserQuickState(userData.person.id);
  
        return {
          userInfo: userData,
          quickState,
        };
      },
    });
  }