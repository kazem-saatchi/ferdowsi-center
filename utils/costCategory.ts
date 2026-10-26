import type { CostCategory } from "@prisma/client";
import { bankTransactionCategoryLabels } from "./label";

/** Every cost category, in the order the pickers list them. Typed against the
 *  Prisma enum so a value the database rejects (the forms once offered "OTHER"
 *  where the enum has OTHER_PAYMENT) fails the type-check instead of the save. */
const COST_CATEGORIES: CostCategory[] = [
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

export const costCategoryLabel = (category: string): string =>
  bankTransactionCategoryLabels[category] ?? category;

export const COST_CATEGORY_OPTIONS = COST_CATEGORIES.map((value) => ({
  value,
  label: costCategoryLabel(value),
}));

export const DEFAULT_COST_CATEGORY: CostCategory = "OTHER_PAYMENT";
