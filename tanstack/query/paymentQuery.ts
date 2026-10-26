import { keepPreviousData, useQuery } from "@tanstack/react-query";
import findPaymentsByPerson from "@/app/api/actions/payment/getAllPaymentsByPerson";
import findPaymentsByShop from "@/app/api/actions/payment/getAllPaymentsByShop";
import getPaymentsPage from "@/app/api/actions/payment/getPaymentsPage";
import { PaymentListOptions } from "@/utils/ledgerListQuery";
import getPaymentBucketPreviewAction from "@/app/api/actions/payment/getPaymentBucketPreview";

//------------------PAYMENT--------------------
/** One page of the all-payments list. The key starts with "all-payments", so
 *  the payment mutations that invalidate that key refresh every page. */
export function usePaymentsPage(options: PaymentListOptions) {
  return useQuery({
    queryKey: ["all-payments", options],
    queryFn: async () => {
      const response = await getPaymentsPage(options);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useFindPaymentsByShop(shopId: string) {
  return useQuery({
    queryKey: ["shop-payments", shopId],
    queryFn: async () => await findPaymentsByShop(shopId),
  });
}

export function useFindPaymentsByPerson(personId: string) {
  return useQuery({
    queryKey: ["person-payments", personId],
    queryFn: async () => await findPaymentsByPerson(personId),
  });
}

/**
 * Who the payment would belong to under each charge type, so the "also update
 * the person" checkbox can show the name before it is applied. Both answers
 * come back together, so toggling the type does not re-query.
 */
export function useGetPaymentBucketPreview(paymentId: string | null) {
  return useQuery({
    queryKey: ["payment-bucket-preview", paymentId],
    queryFn: async () => await getPaymentBucketPreviewAction(paymentId!),
    enabled: Boolean(paymentId),
  });
}
