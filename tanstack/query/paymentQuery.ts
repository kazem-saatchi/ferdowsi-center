import { useQuery } from "@tanstack/react-query";
import findPaymentsByPerson from "@/app/api/actions/payment/getAllPaymentsByPerson";
import findPaymentsByShop from "@/app/api/actions/payment/getAllPaymentsByShop";
import findAllPayments from "@/app/api/actions/payment/getAllPayments";
import getPaymentBucketPreviewAction from "@/app/api/actions/payment/getPaymentBucketPreview";

//------------------PAYMENT--------------------
export function useFindAllPayments() {
  return useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => await findAllPayments(),
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
