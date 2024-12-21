import { StateCreator } from "zustand";
import { ShopHistory } from "@prisma/client";

type Histories = {
  allHistories: ShopHistory[] | null;
  setAllHistories: (histories: ShopHistory[]) => void;
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

  // Set utils
  setAllHistories: (histories) => set({ allHistories: histories }),
});
