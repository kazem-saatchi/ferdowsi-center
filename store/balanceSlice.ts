import {
  ChargePaymentData,
  PersonBalanceByShopData,
  PersonBalanceData,
  ShopBalanceData,
  ShopBalanceDetails,
  ShopsBalanceData,
} from "@/schema/balanceSchema";
import { PersonInfoSafe } from "@/schema/personSchema";
// The all-shops lists print through utils/shopsBalanceExcel; only the PDF
// exports still go through the generic SheetJS/jsPDF helpers.
import { exportToPDF } from "@/utils/tableExport";
import {
  exportBalanceDetailToExcel,
  type BalanceDetailExcelOptions,
} from "@/utils/balanceDetailExcel";
import {
  exportShopsBalanceToExcel,
  type ShopsBalanceRow,
  type ShopsBalanceVariant,
} from "@/utils/shopsBalanceExcel";
import { StateCreator } from "zustand";

type Balances = {
  allBalances: ShopsBalanceData[] | null;
  allBalanceDetails: ShopBalanceDetails[] | null;
  setAllBalances: (balances: ShopsBalanceData[]) => void;
  setAllBalanceDetails: (details: ShopBalanceDetails[]) => void;
  allBalanceFiltered: ShopsBalanceData[] | null;
  /** Minimum debt the on-screen filter is set to, in rials — kept so the Excel
   *  report can print which threshold produced a short list. */
  allBalanceMinDebt: number | null;
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
  exportAllBalanceToPDFFiltered: () => void;
  exportBalanceDetailToExcel: (options: BalanceDetailExcelOptions) => Promise<void>;
  exportShopsBalanceToExcel: (options: ShopsBalanceExportOptions) => Promise<void>;
};

export interface ShopsBalanceExportOptions {
  variant: ShopsBalanceVariant;
  lastBankTransactionDate?: Date | null;
  /** Export only the shops the on-screen balance filter kept. */
  filtered?: boolean;
  fileName?: string;
}

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
  allBalanceMinDebt: null,
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
      set({ allBalanceFiltered: get().allBalances ?? [], allBalanceMinDebt: null });
      return;
    }
    set({
      allBalanceFiltered:
        get().allBalances?.filter((balance) => balance.balance < -value) ?? [],
      allBalanceMinDebt: value,
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
  setShopOwnerBalance: (data) => set({ shopOwnerBalanceData: data }),
  setShopRenterBalance: (data) => set({ shopRenterBalanceData: data }),

  exportBalanceDetailToExcel: async (options: BalanceDetailExcelOptions) => {
    if (!options.charges || !options.payments) {
      console.error("No balance detail data to export");
      return;
    }
    await exportBalanceDetailToExcel(options);
  },

  exportShopsBalanceToExcel: async ({
    variant,
    lastBankTransactionDate,
    filtered = false,
    fileName,
  }: ShopsBalanceExportOptions) => {
    const state = get();
    // The rent page feeds allBalances (one balance per shop); the two shop
    // pages feed allBalanceDetails (owner/renter/total).
    const rows: ShopsBalanceRow[] | null =
      variant === "rent" ? state.allBalances : state.allBalanceDetails;
    if (!rows || rows.length === 0) {
      console.error("No balance data to export");
      return;
    }

    // Same rule as the on-screen filter: balance is payment − charge, so a debt
    // over the threshold is a balance below its negative.
    const minDebt = filtered ? state.allBalanceMinDebt : null;
    const shops = minDebt
      ? rows.filter((shop) => balanceOf(shop) < -minDebt)
      : rows;

    await exportShopsBalanceToExcel({
      shops,
      variant,
      minDebt,
      lastBankTransactionDate,
      fileName:
        fileName ??
        `${REPORT_FILE_NAMES[variant]}${minDebt ? "-Filtered" : ""}-Report`,
    });
  },
});

const REPORT_FILE_NAMES: Record<ShopsBalanceVariant, string> = {
  monthly: "Shops-Balance-Monthly",
  yearly: "Shops-Balance-Yearly",
  rent: "Rents-Balance",
};

const balanceOf = (row: ShopsBalanceRow) =>
  "totalBalance" in row ? row.totalBalance : row.balance;

const getBalanceColumns = () => [
  { header: "پلاک", accessor: "plaque" },
  { header: "نام مالک", accessor: "ownerName" },
  { header: "مانده حساب مالک", accessor: "ownerBalance" },
  { header: "نام مستاجر ", accessor: "renterName" },
  { header: "مانده حساب مستاجر", accessor: "renterBalance" },
  { header: "مانده حساب", accessor: "totalBalance" },
];
