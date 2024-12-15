"use client";

import findPersonAll from "@/app/api/actions/person/findPersonAll";
import findPersonById from "@/app/api/actions/person/findPersonById";
import findAllShops from "@/app/api/actions/shop/allShops";
import { useQuery } from "@tanstack/react-query";

export function useFindPersonById(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => await findPersonById({ IdNumber: id }),
  });
}

export function useFindPersonAll() {
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
