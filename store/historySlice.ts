import { StateCreator } from "zustand";
import { ShopHistory } from "@prisma/client";

type Histories = {
  allHistories: ShopHistory[] | null;
  setAllHistories: (histories: ShopHistory[]) => void;
  shopHistories: ShopHistory[] | null;
  setShopHistories: (histories: ShopHistory[]) => void;
  personHistories: ShopHistory[] | null;
  setPersonHistories: (histories: ShopHistory[]) => void;
};

export type HistorySlice = Histories;

export const createHistorySlice: StateCreator<
  HistorySlice,
  [["zustand/immer", never]],
  [],
  HistorySlice
> = (set) => ({
  // State
  allHistories: null,
  shopHistories: null,
  personHistories: null,

  // Set utils
  setAllHistories: (histories) => set({ allHistories: histories }),
  setShopHistories: (histories) => set({ shopHistories: histories }),
  setPersonHistories: (histories) => set({ personHistories: histories }),
});
