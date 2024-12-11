"use client";

import findPersonById from "@/app/api/actions/person/findPersonById";
import { useQuery } from "@tanstack/react-query";

export function useFindPersonById(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => await findPersonById({ IdNumber: id }),
  });
}
