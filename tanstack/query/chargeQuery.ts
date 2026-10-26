import { GetChargeByPersonData, GetChargeByShopData } from "@/schema/chargeSchema";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import getChargesPage from "@/app/api/actions/charge/getChargesPage";
import { LedgerListOptions } from "@/utils/ledgerListQuery";
import findChargesByPerson from "@/app/api/actions/charge/getChargesByPerson";
import findChargesByShop from "@/app/api/actions/charge/getChargesByShop";
import findAllChargesReference from "@/app/api/actions/reference/getAllChargesReference";

//------------------CHARGE--------------------
/** One page of the all-charges list. The key starts with "all-charges", so
 *  the charge mutations that invalidate that key refresh every page. */
export function useChargesPage(options: LedgerListOptions) {
  return useQuery({
    queryKey: ["all-charges", options],
    queryFn: async () => {
      const response = await getChargesPage(options);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
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
