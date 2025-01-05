import { PersonBalanceData, ShopBalanceData } from "@/schema/balanceSchema";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopBalanceData[] | null;
  setAllBalances: (Balances: ShopBalanceData[]) => void;
  shopBalances: ShopBalanceData[] | null;
  setShopBalances: (Balances: ShopBalanceData[]) => void;
  personBalances: PersonBalanceData[] | null;
  setPersonBalances: (Balances: PersonBalanceData[]) => void;
  exportAllBalanceToPDF: () => void;
  exportAllBalanceToExcel: () => void;
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
  exportAllBalanceToPDF: () =>
    set((state) => {
      if (!state.allBalances || state.allBalances.length === 0) {
        console.error("No balance data to export");
        return;
      }
      exportToPDF({
        fileName: "Balance-Report",
        data: state.allBalances,
        columns: getBalanceColumns(),
      });
    }),
  exportAllBalanceToExcel: () =>
    set((state) => {
      if (!state.allBalances || state.allBalances.length === 0) {
        console.error("No balance data to export");
        return;
      }
      exportToExcel({
        fileName: "Balance-Report",
        data: state.allBalances,
        columns: getBalanceColumns(),
      });
    }),
});

const getBalanceColumns = () => [
  { header: "پلاک", accessor: "plaque" },
  { header: "جمع شارژ", accessor: "totalCharge" },
  { header: "جمع پرداخت", accessor: "totalPayment" },
  { header: "مانده حساب", accessor: "balance" },
];
