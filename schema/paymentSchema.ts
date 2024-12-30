import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPaymentByInfoSchema = z.object({
  shopId: z.string(),
  personId: z.string(),
  date: z.date(),
  amount: z.number().int().positive(), // Ensures a positive integer
});

export type AddPaymentByInfoData = z.infer<typeof addPaymentByInfoSchema>;
//--------------------------------------------------------------------------------------
