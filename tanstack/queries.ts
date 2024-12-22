"use client";

import findAllShopHistory from "@/app/api/actions/history/getAllHistory";
import findHistoryByPerson from "@/app/api/actions/history/getHistoryByPerson";
import findHistoryByShop from "@/app/api/actions/history/getHistoryByShop";
import findPersonAll from "@/app/api/actions/person/findPersonAll";
import findPersonById from "@/app/api/actions/person/findPersonById";
import findPersonByShop from "@/app/api/actions/person/findPersonByShop";
import findAllShops from "@/app/api/actions/shop/allShops";
import findShopById from "@/app/api/actions/shop/findShopById";
import { useQuery } from "@tanstack/react-query";

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

export function useFindAllShops() {
  return useQuery({
    queryKey: ["all-shops"],
    queryFn: async () => await findAllShops(),
  });
}

export function useFindShopById(id: string) {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: async () => await findShopById(id),
  });
}

export function usePersonsByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-persons", shopId],
    queryFn: async () => await findPersonByShop(shopId),
  });
}

export function useShopHistoryAll() {
  return useQuery({
    queryKey: ["all-histories"],
    queryFn: async () => await findAllShopHistory(),
  });
}

export function useShopHistoryByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-history", shopId],
    queryFn: async () => await findHistoryByShop(shopId),
  });
}

export function useShopHistoryByPerson(personId: string) {
  return useQuery({
    queryKey: ["person-history", personId],
    queryFn: async () => await findHistoryByPerson(personId),
  });
}
