import { PersonBalanceData, ShopBalanceData } from "@/schema/balanceSchema";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopBalanceData[] | null;
  setAllBalances: (Balances: ShopBalanceData[]) => void;
  shopBalance: ShopBalanceData | null;
  setShopBalance: (Balances: ShopBalanceData) => void;
  personsBalance: PersonBalanceData[] | null;
  setPersonsBalance: (Balances: PersonBalanceData[]) => void;
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
  shopBalance: null,
  personsBalance: null,

  // Set utils
  setAllBalances: (Balances) => set({ allBalances: Balances }),
  setShopBalance: (Balances) => set({ shopBalance: Balances }),
  setPersonsBalance: (Balances) => set({ personsBalance: Balances }),
  exportAllBalanceToPDF: () =>
    set((state) => {
      if (!state.allBalances || state.allBalances.length === 0) {
        console.error("No balance data to export");
        return;
      }
      exportToPDF({
        fileName: "Balance-Report",
        data: state.allBalances,
        columns: getBalanceColumnsPdf(),
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

const getBalanceColumnsPdf = () => [
  { header: "Plaque", accessor: "plaque" },
  { header: "Charge Total ", accessor: "totalCharge" },
  { header: "Payment Total", accessor: "totalPayment" },
  { header: "Balance", accessor: "balance" },
];
