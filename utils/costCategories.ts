import { CostCategory } from "@prisma/client";

// Get category display names in Persian
export const categoryNames: Record<CostCategory, string> = {
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
};
