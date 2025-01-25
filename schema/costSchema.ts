import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addCostSchema = z.object({
  title: z.string(),
  amount: z.number().int(),
  date: z.date(),
  description: z.string().max(255).optional(),
  category: z.enum([
    "ELECTRICITY",
    "WATER",
    "GAS",
    "ELEVATOR",
    "ESCALATOR",
    "CHILLER",
    "CLEANING",
    "SECURITY",
    "OTHER",
  ]),
  billImage: z.string(),
  proprietor: z.boolean().default(false),
});

export type AddCostData = z.infer<typeof addCostSchema>;
//--------------------------------------------------------------------------------------
