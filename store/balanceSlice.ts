import {
  ChargePaymentData,
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
  ShopBalanceDetails,
  ShopsBalanceData,
} from "@/schema/balanceSchema";
import { PersonInfoSafe } from "@/schema/personSchema";
import {
  exportToExcel,
  exportToPDF,
  exportBalanceDetailToPDF,
  exportBalanceDetailToExcel,
} from "@/utils/tableExport";
import { StateCreator } from "zustand";
import { Charge, Payment } from "@prisma/client";

type Balances = {
  allBalances: ShopsBalanceData[] | null;
  allBalanceDetails: ShopBalanceDetails[] | null;
  setAllBalances: (balances: ShopsBalanceData[]) => void;
  setAllBalanceDetails: (details: ShopBalanceDetails[]) => void;
  allBalanceFiltered: ShopsBalanceData[] | null;
  setAllBalanceFiltered: (value: number | null) => void;
  shopBalance: ShopBalanceData | null;
  setShopBalance: (balances: ShopBalanceData) => void;
  personBalance: PersonBalanceData | null;
  setPersonBalance: (balance: PersonBalanceData) => void;
  shopsBalance: ShopBalanceData[] | null;
  setShopsBalance: (balances: ShopBalanceData[]) => void;
  personsBalance: PersonBalanceByShopData[] | null;
  setPersonsBalance: (Balances: PersonBalanceByShopData[]) => void;
  shopOwnerBalanceData: OwnerRenterBalance | null;
  shopRenterBalanceData: OwnerRenterBalance | null;
  setShopOwnerBalance: (data: OwnerRenterBalance | null) => void;
  setShopRenterBalance: (data: OwnerRenterBalance | null) => void;
  exportAllBalanceToPDF: () => void;
  exportAllBalanceToExcel: () => void;
  exportAllBalanceToPDFFiltered: () => void;
  exportAllBalanceToExcelFiltered: () => void;
  exportBalanceDetailToPDF: (charges: Charge[], payments: Payment[]) => void;
  exportBalanceDetailToExcel: (charges: Charge[], payments: Payment[]) => void;
};

export interface OwnerRenterBalance {
  person: PersonInfoSafe;
  chargeList: ChargePaymentData[];
  paymentList: ChargePaymentData[];
}

export type BalanceSlice = Balances;

export const createBalanceSlice: StateCreator<
  BalanceSlice,
  [["zustand/immer", never]],
  [],
  BalanceSlice
> = (set, get) => ({
  // State
  allBalances: null,
  allBalanceDetails: null,
  allBalanceFiltered: null,
  shopBalance: null,
  personBalance: null,
  shopsBalance: null,
  personsBalance: null,
  shopOwnerBalanceData: null,
  shopRenterBalanceData: null,

  // Set utils
  setAllBalances: (balances) => set({ allBalances: balances }),
  setAllBalanceDetails: (details) => set({ allBalanceDetails: details }),
  setAllBalanceFiltered: (value) => {
    if (value === null) {
      set({ allBalanceFiltered: get().allBalances ?? [] });
      return;
    }
    set({
      allBalanceFiltered:
        get().allBalances?.filter((balance) => balance.balance < -value) ?? [],
    });
  },
  setShopBalance: (balances) => set({ shopBalance: balances }),
  setPersonBalance: (balance) => set({ personBalance: balance }),
  setShopsBalance: (balances) => set({ shopsBalance: balances }),
  setPersonsBalance: (Balances) => set({ personsBalance: Balances }),
  exportAllBalanceToPDF: () => {
    const state = get();
    if (!state.allBalances || state.allBalances.length === 0) {
      console.error("No balance data to export");
      return;
    }
    exportToPDF({
      fileName: "Balance-Report",
      data: state.allBalances,
      columns: getBalanceColumns(),
    });
  },
  exportAllBalanceToExcel: () => {
    const state = get();
    if (!state.allBalanceDetails || state.allBalanceDetails.length === 0) {
      console.error("No balance data to export");
      return;
    }
    exportToExcel({
      fileName: "Balance-Report",
      data: state.allBalanceDetails,
      columns: getBalanceColumns(),
    });
  },
  exportAllBalanceToPDFFiltered: () => {
    const state = get();
    if (!state.allBalanceFiltered || state.allBalanceFiltered.length === 0) {
      console.error("No balance data to export");
      return;
    }
    exportToPDF({
      fileName: "Balance-Report-Filtered",
      data: state.allBalanceFiltered,
      columns: getBalanceColumns(),
    });
  },
  exportAllBalanceToExcelFiltered: () => {
    const state = get();
    if (!state.allBalanceFiltered || state.allBalanceFiltered.length === 0) {
      console.error("No balance data to export");
      return;
    }
    exportToExcel({
      fileName: "Balance-Report-Filtered",
      data: state.allBalanceFiltered,
      columns: getBalanceColumns(),
    });
  },
  setShopOwnerBalance: (data) => set({ shopOwnerBalanceData: data }),
  setShopRenterBalance: (data) => set({ shopRenterBalanceData: data }),

  // New functions for balance detail export
  exportBalanceDetailToPDF: (charges: Charge[], payments: Payment[]) => {
    if (!charges || !payments) {
      console.error("No balance detail data to export");
      return;
    }
    exportBalanceDetailToPDF({ charges, payments }, "Balance-Detail-Report");
  },
  exportBalanceDetailToExcel: (charges: Charge[], payments: Payment[]) => {
    if (!charges || !payments) {
      console.error("No balance detail data to export");
      return;
    }
    exportBalanceDetailToExcel({ charges, payments }, "Balance-Detail-Report");
  },
});

const getBalanceColumns = () => [
  { header: "پلاک", accessor: "plaque" },
  { header: "نام مالک", accessor: "ownerName" },
  { header: "مانده حساب مالک", accessor: "ownerBalance" },
  { header: "نام مستاجر ", accessor: "renterName" },
  { header: "مانده حساب مستاجر", accessor: "renterBalance" },
  { header: "مانده حساب", accessor: "totalBalance" },
];
