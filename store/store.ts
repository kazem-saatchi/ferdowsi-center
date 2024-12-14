import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createUserSlice, UserSlice } from "./userSlice";
import { createShopSlice, ShopSlice } from "./shopSlice";

// Store Type
export type StoreType = UserSlice & ShopSlice;

// Store Main State
export const useStore = create<StoreType>()(
  immer((set, get, store) => ({
    ...createUserSlice(set, get, store),
    ...createShopSlice(set, get, store),
  }))
);
