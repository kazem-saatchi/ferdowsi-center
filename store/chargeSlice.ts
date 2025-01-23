import { StateCreator } from "zustand";
import { Charge, ShopChargeReference } from "@prisma/client";

type Charges = {
  allCharges: Charge[] | null;
  setAllCharges: (charges: Charge[]) => void;
  shopCharges: Charge[] | null;
  setShopCharges: (charges: Charge[]) => void;
  personCharges: Charge[] | null;
  setPersonCharges: (charges: Charge[]) => void;
  allChargesReference: ShopChargeReference[] | null;
  setAllChargesReference: (chargeReference: ShopChargeReference[]) => void;
  allAnnualChargesReference: ShopChargeReference[] | null;
  setAllAnnualChargesReference: (
    chargeReference: ShopChargeReference[]
  ) => void;
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
  allChargesReference: null,
  allAnnualChargesReference: null,

  // Set utils
  setAllCharges: (charges) => set({ allCharges: charges }),
  setShopCharges: (charges) => set({ shopCharges: charges }),
  setPersonCharges: (charges) => set({ personCharges: charges }),
  setAllChargesReference: (chargeList) =>
    set({ allChargesReference: chargeList }),
  setAllAnnualChargesReference: (chargeList) =>
    set({ allAnnualChargesReference: chargeList }),
});
