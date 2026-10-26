import { StateCreator } from "zustand";
import { Charge, ShopChargeReference } from "@prisma/client";

type Charges = {
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
  allRentReference: ShopChargeReference[] | null;
  setAllRentReference: (charges: ShopChargeReference[]) => void;
};

export type ChargeSlice = Charges;

export const createChargeSlice: StateCreator<
  ChargeSlice,
  [["zustand/immer", never]],
  [],
  ChargeSlice
> = (set) => ({
  // State
  shopCharges: null,
  allRentReference: null,
  personCharges: null,
  allChargesReference: null,
  allAnnualChargesReference: null,

  // Set utils
  setShopCharges: (charges) => set({ shopCharges: charges }),
  setAllRentReference: (charges) => set({ allRentReference: charges }),
  setPersonCharges: (charges) => set({ personCharges: charges }),
  setAllChargesReference: (chargeList) =>
    set({ allChargesReference: chargeList }),
  setAllAnnualChargesReference: (chargeList) =>
    set({ allAnnualChargesReference: chargeList }),
});
