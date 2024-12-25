import { StateCreator } from "zustand";
import { Charge } from "@prisma/client";

type Charges = {
  allCharges: Charge[] | null;
  setAllCharges: (charges: Charge[]) => void;
  shopCharges: Charge[] | null;
  setShopCharges: (charges: Charge[]) => void;
  personCharges: Charge[] | null;
  setPersonCharges: (charges: Charge[]) => void;
};

export type ChargeSlice = Charges;

export const createChargeSlice: StateCreator<
  ChargeSlice,
  [["zustand/immer", never]],
  [],
  ChargeSlice
> = (set) => ({
  // State
  allCharges: null,
  shopCharges: null,
  personCharges: null,

  // Set utils
  setAllCharges: (charges) => set({ allCharges: charges }),
  setShopCharges: (charges) => set({ shopCharges: charges }),
  setPersonCharges: (charges) => set({ personCharges: charges }),
});
