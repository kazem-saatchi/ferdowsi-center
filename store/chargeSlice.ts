import { StateCreator } from "zustand";
import { Charge, ShopChargeReference } from "@prisma/client";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";

import { getYear } from "date-fns-jalali";

// Get current Persian year
const currentYear = getYear(new Date());

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
  exportChargeListToPDF: () => void;
  exportChargeListToExcel: () => void;
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

  exportChargeListToPDF: () =>
    set((state) => {
      if (!state.allChargesReference || state.allChargesReference.length === 0) {
        console.error("No Charge data to export");
        return;
      }
      exportToPDF({
        fileName: `لیست شارژ ${currentYear}`,
        data: state.allChargesReference,
        columns: getBalanceColumns(),
      });
    }),
  exportChargeListToExcel: () =>
    set((state) => {
      if (!state.allChargesReference || state.allChargesReference.length === 0) {
        console.error("No Charge data to export");
        return;
      }
      exportToExcel({
        fileName: `لیست شارژ ${currentYear}`,
        data: state.allChargesReference,
        columns: getBalanceColumns(),
      });
    }),
});

const getBalanceColumns = () => [
  { header: "مبلغ شارژ", accessor: "totalAmount" },
  { header: "مساحت", accessor: "area" },
  { header: "پلاک", accessor: "plaque" },
];
