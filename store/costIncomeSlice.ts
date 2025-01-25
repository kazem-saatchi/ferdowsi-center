import { StateCreator } from "zustand";
import { Cost } from "@prisma/client";

type Costs = {
  allCosts: Cost[] | null;
  setAllCosts: (costs: Cost[]) => void;
};

export type CostIncomeSlice = Costs;

export const createCostIncomeSlice: StateCreator<
  CostIncomeSlice,
  [["zustand/immer", never]],
  [],
  CostIncomeSlice
> = (set) => ({
  // States
  allCosts: null,

  // Set Utils
  setAllCosts: (costs) => set({ allCosts: costs }),
});
