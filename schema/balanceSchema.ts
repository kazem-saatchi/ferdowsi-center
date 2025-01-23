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
export const personBalanceByShopSchema = z.object({
  shopId: z.string(),
  plaque: z.number(),
  personId: z.string(),
  personName: z.string(),
  totalCharge: z.number(),
  totalPayment: z.number(),
  balance: z.number(),
});

export type PersonBalanceByShopData = z.infer<typeof personBalanceByShopSchema>;
//--------------------------------------------------------------------------------------
export const personBalanceSchema = personBalanceByShopSchema.omit({
  shopId: true,
  plaque: true,
});

export type PersonBalanceData = z.infer<typeof personBalanceSchema>;
//--------------------------------------------------------------------------------------
