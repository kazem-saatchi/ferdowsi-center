import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createUserSlice, UserSlice } from "./userSlice";
import { createShopSlice, ShopSlice } from "./shopSlice";
import { createHistorySlice, HistorySlice } from "./historySlice";
import { ChargeSlice, createChargeSlice } from "./chargeSlice";
import { createPaymentSlice, PaymentSlice } from "./paymentSlice";

// Store Type
export type StoreType = UserSlice &
  ShopSlice &
  HistorySlice &
  ChargeSlice &
  PaymentSlice;

// Store Main State
export const useStore = create<StoreType>()(
  immer((set, get, store) => ({
    ...createUserSlice(set, get, store),
    ...createShopSlice(set, get, store),
    ...createHistorySlice(set, get, store),
    ...createChargeSlice(set, get, store),
    ...createPaymentSlice(set, get, store),
  }))
);
