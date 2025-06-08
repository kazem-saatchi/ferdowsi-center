import { useQuery } from "@tanstack/react-query";
import findPaymentsByPerson from "@/app/api/actions/payment/getAllPaymentsByPerson";
import findPaymentsByShop from "@/app/api/actions/payment/getAllPaymentsByShop";
import findAllPayments from "@/app/api/actions/payment/getAllPayments";

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
