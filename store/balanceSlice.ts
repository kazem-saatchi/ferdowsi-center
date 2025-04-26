import {
  ChargePaymentData,
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
} from "@/schema/balanceSchema";
import { PersonInfoSafe } from "@/schema/userSchemas";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopBalanceData[] | null;
  setAllBalances: (balances: ShopBalanceData[]) => void;
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
> = (set) => ({
  // State
  allBalances: null,
  shopBalance: null,
  personBalance: null,
  shopsBalance: null,
  personsBalance: null,
  shopOwnerBalanceData: null,
  shopRenterBalanceData: null,

  // Set utils
  setAllBalances: (balances) => set({ allBalances: balances }),
  setShopBalance: (balances) => set({ shopBalance: balances }),
  setPersonBalance: (balance) => set({ personBalance: balance }),
  setShopsBalance: (balances) => set({ shopsBalance: balances }),
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

  setShopOwnerBalance: (data) => set({ shopOwnerBalanceData: data }),
  setShopRenterBalance: (data) => set({ shopRenterBalanceData: data }),
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
