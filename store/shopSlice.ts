import { StateCreator } from "zustand";
import { Shop } from "@prisma/client";
import { AddShopData } from "@/schema/shopSchema";

type Shops = {
  shopById: Shop | null;
  setshopById: (shop: Shop) => void;
  shopsAll: Shop[] | null;
  setshopsAll: (shops: Shop[]) => void;
  newShop: AddShopData;
  setNewShop: (property: string, value: any) => void;
  resetNewShop: () => void;
};

export type ShopSlice = Shops;

export const createShopSlice: StateCreator<
  ShopSlice,
  [["zustand/immer", never]],
  [],
  ShopSlice
> = (set) => ({
  // States
  shopById: null,
  shopsAll: null,
  newShop: newShopDefault,

  // Set Utils
  setshopById: (shop) => set({ shopById: shop }),
  setshopsAll: (shops) => set({ shopsAll: shops }),
  setNewShop: (property, value) =>
    set((state) => {
      state.newShop = { ...state.newShop, [property]: value };
    }),
  resetNewShop: () =>
    set({
      newShop: newShopDefault,
    }),
});

const newShopDefault: AddShopData = {
  plaque: 0,
  area: 0,
  floor: 1,
  type: "STORE",
  ownerId: "",
  renterId: null,
  bankCardMonthly: "",
  bankCardYearly: "",
};
