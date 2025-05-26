import { CostCategory } from "@prisma/client";
import { z } from "zod";

const CostCategoryType = Object.values(CostCategory) as [string, ...string[]];

//--------------------------------------------------------------------------------------
export const addCostSchema = z.object({
  title: z.string(),
  amount: z.number().int(),
  date: z.date(),
  description: z.string().max(255).optional(),
  category: z.enum(CostCategoryType),
  billImage: z.string(),
  proprietor: z.boolean().default(false),
});

export type AddCostData = z.infer<typeof addCostSchema>;
//--------------------------------------------------------------------------------------
export const addIncomeSchema = z.object({
  title: z.string(),
  amount: z.number().int(),
  date: z.date(),
  description: z.string().max(255).optional(),
  billImage: z.string(),
  proprietor: z.boolean().default(false),
  name: z.string(),
});

export type AddIncomeData = z.infer<typeof addIncomeSchema>;
//--------------------------------------------------------------------------------------
export const addCostFromBankSchema = addCostSchema.extend({
  bankTransactionId: z.string(),
});

export type AddCostFromBankData = z.infer<typeof addCostFromBankSchema>;
//--------------------------------------------------------------------------------------
