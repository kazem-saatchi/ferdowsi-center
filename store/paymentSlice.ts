import { StateCreator } from "zustand";
import { Payment } from "@prisma/client";

type Payments = {
  allPayments: Payment[] | null;
  setAllPayments: (payments: Payment[]) => void;
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
  allPayments: null,
  shopPayments: null,
  personPayments: null,

  // Set utils
  setAllPayments: (payments) => set({ allPayments: payments }),
  setShopPayments: (payments) => set({ shopPayments: payments }),
  setPersonPayments: (payments) => set({ personPayments: payments }),

});
