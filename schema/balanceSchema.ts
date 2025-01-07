import { z } from "zod";

//--------------------------------------------------------------------------------------
export const shopBalanceSchema = z.object({
  shopId: z.string(),
  plaque: z.number(),
  totalCharge: z.number(),
  totalPayment: z.number(),
  balance: z.number(),
});

export type ShopBalanceData = z.infer<typeof shopBalanceSchema>;
//--------------------------------------------------------------------------------------
export const personBalanceSchema = z.object({
  personId: z.string(),
  personName: z.string(),
  totalCharge: z.number(),
  totalPayment: z.number(),
  balance: z.number(),
});

export type PersonBalanceData = z.infer<typeof personBalanceSchema>;
//--------------------------------------------------------------------------------------
