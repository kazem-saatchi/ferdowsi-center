import {
  ChargePaymentData,
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
  ShopsBalanceData,
} from "@/schema/balanceSchema";
import { PersonInfoSafe } from "@/schema/userSchemas";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopsBalanceData[] | null;
  setAllBalances: (balances: ShopsBalanceData[]) => void;
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
  { header: "نام مالک", accessor: "ownerName" },
  { header: "نام مستاجر ", accessor: "renterName" },
  { header: "مانده حساب", accessor: "balance" },
];

const getBalanceColumnsPdf = () => [
  { header: "Plaque", accessor: "plaque" },
  { header: "Owner Name", accessor: "ownerName" },
  { header: "Renter Name", accessor: "renterName" },
  { header: "Balance", accessor: "balance" },
];
