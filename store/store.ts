import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createUserSlice, UserSlice } from "./userSlice";
import { createShopSlice, ShopSlice } from "./shopSlice";
import { createHistorySlice, HistorySlice } from "./historySlice";
import { ChargeSlice, createChargeSlice } from "./chargeSlice";
import { createPaymentSlice, PaymentSlice } from "./paymentSlice";
import { BalanceSlice, createBalanceSlice } from "./balanceSlice";

// Store Type
export type StoreType = UserSlice &
  ShopSlice &
  HistorySlice &
  ChargeSlice &
  PaymentSlice &
  BalanceSlice;

// Store Main State
export const useStore = create<StoreType>()(
  immer((set, get, store) => ({
    ...createUserSlice(set, get, store),
    ...createShopSlice(set, get, store),
    ...createHistorySlice(set, get, store),
    ...createChargeSlice(set, get, store),
    ...createPaymentSlice(set, get, store),
    ...createBalanceSlice(set, get, store),
  }))
);
