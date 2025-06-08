import { GetChargeByPersonData, GetChargeByShopData } from "@/schema/chargeSchema";
import { useQuery } from "@tanstack/react-query";
import findAllCharges from "@/app/api/actions/charge/getAllCharges";
import findChargesByPerson from "@/app/api/actions/charge/getChargesByPerson";
import findChargesByShop from "@/app/api/actions/charge/getChargesByShop";
import findAllChargesReference from "@/app/api/actions/reference/getAllChargesReference";

//------------------CHARGE--------------------
export function useFindAllCharges() {
  return useQuery({
    queryKey: ["all-charges"],
    queryFn: async () => await findAllCharges(),
  });
}

export function useFindChargesByShop(data: GetChargeByShopData) {
  return useQuery({
    queryKey: ["shop-charges", data.shopId],
    queryFn: async () => await findChargesByShop({ shopId: data.shopId }),
  });
}

export function useFindChargesByPerson(data: GetChargeByPersonData) {
  return useQuery({
    queryKey: ["person-charges", data.personId],
    queryFn: async () => await findChargesByPerson({ personId: data.personId }),
  });
}

export function useFindAllChargesReference() {
  return useQuery({
    queryKey: ["all-charges-reference"],
    queryFn: async () => await findAllChargesReference(),
  });
}
