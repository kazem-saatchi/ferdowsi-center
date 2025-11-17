import { TransactionType, TransactionCategory } from "@prisma/client";

// Income and Payment category arrays
export const incomeCategories: TransactionCategory[] = [
  "KIOSK",
  "MONTHLY",
  "YEARLY",
  "RENT",
  "SELL",
  "ADVERTISMENT",
  "CONTRACT_FEE",
  "OTHER_INCOME",
];

export const paymentCategories: TransactionCategory[] = [
  "ELECTRICITY",
  "WATER",
  "GAS",
  "ELEVATOR",
  "ESCALATOR",
  "CHILLER",
  "CLEANING",
  "SECURITY",
  "SALARY",
  "UTILITIES",
  "TAX",
  "OTHER_PAYMENT",
];

// Get transaction category display names in Persian
export const transactionCategoryNames: Record<string, string> = {
  // Income categories
  KIOSK: "درآمد مشاعات",
  MONTHLY: "درآمد شارژ ماهانه",
  YEARLY: "درآمد شارژ مالکانه",
  RENT: "درآمد از اجاره",
  SELL: "درآمد فروش",
  ADVERTISMENT: "درآمد تبلیغات",
  CONTRACT_FEE: "درآمد قرارداد",
  OTHER_INCOME: "سایر درآمدها",

  // Payment categories
  ELECTRICITY: "قبض برق",
  WATER: "قبض آب",
  GAS: "قبض گاز",
  ELEVATOR: "تعمیرات آسانسور",
  ESCALATOR: "تعمیرات پله برقی",
  CHILLER: "تعمیرات موتورخانه",
  CLEANING: "خدمات نظافت",
  SECURITY: "خدمات نگهبانی",
  SALARY: "حقوق کارمندان",
  UTILITIES: "تجهیزات",
  TAX: "مالیات",
  OTHER_PAYMENT: "سایر خدمات",

  // Special case
  UNCATEGORIZED: "دسته‌بندی نشده",
};

// Get transaction type display names
export const transactionTypeNames: Record<TransactionType, string> = {
  INCOME: "درآمد",
  PAYMENT: "پرداخت",
  UNKNOWN: "نامشخص",
};
