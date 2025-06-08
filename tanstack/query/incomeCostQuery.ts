import { useQuery } from "@tanstack/react-query";
import getAllCosts from "@/app/api/actions/cost-income/getAllCosts";

//------------------COST--------------------

// get all costs data
export function useGetAllCosts() {
  return useQuery({
    queryKey: ["all-costs"],
    queryFn: async () => await getAllCosts(),
  });
}
