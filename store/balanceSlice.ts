import { PersonBalanceData, ShopBalanceData } from "@/schema/balanceSchema";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopBalanceData[] | null;
  setAllBalances: (Balances: ShopBalanceData[]) => void;
  shopBalances: ShopBalanceData[] | null;
  setShopBalances: (Balances: ShopBalanceData[]) => void;
  personBalances: PersonBalanceData[] | null;
  setPersonBalances: (Balances: PersonBalanceData[]) => void;
};

export type BalanceSlice = Balances;

export const createBalanceSlice: StateCreator<
  BalanceSlice,
  [["zustand/immer", never]],
  [],
  BalanceSlice
> = (set) => ({
  // State
  allBalances: null,
  shopBalances: null,
  personBalances: null,

  // Set utils
  setAllBalances: (Balances) => set({ allBalances: Balances }),
  setShopBalances: (Balances) => set({ shopBalances: Balances }),
  setPersonBalances: (Balances) => set({ personBalances: Balances }),
});
