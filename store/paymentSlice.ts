import { StateCreator } from "zustand";
import { Payment } from "@prisma/client";

type Payments = {
  shopPayments: Payment[] | null;
  setShopPayments: (payments: Payment[]) => void;
  personPayments: Payment[] | null;
  setPersonPayments: (payments: Payment[]) => void;
};

export type PaymentSlice = Payments;

export const createPaymentSlice: StateCreator<
  PaymentSlice,
  [["zustand/immer", never]],
  [],
  PaymentSlice
> = (set) => ({
  // State
  shopPayments: null,
  personPayments: null,

  // Set utils
  setShopPayments: (payments) => set({ shopPayments: payments }),
  setPersonPayments: (payments) => set({ personPayments: payments }),

});
