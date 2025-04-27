import { z } from "zod";

//--------------------------------------------------------------------------------------
export const shopBalanceSchema = z.object({
  shopId: z.string(),
  plaque: z.number(),
  totalCharge: z.number(),
  totalPayment: z.number(),
  balance: z.number(),
  totalChargeMonthly: z.number(),
  totalChargeYearly: z.number(),
  totalPaymentMonthly: z.number(),
  totalPaymentYearly: z.number(),
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
export const chargePaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  title: z.string(),
  date: z.date(),
  proprietor: z.boolean(),
});

export type ChargePaymentData = z.infer<typeof chargePaymentSchema>;
//--------------------------------------------------------------------------------------
export const shopsBalanceSchema = z.object({
  plaque: z.number(),
  balance: z.number(),
  ownerName: z.string(),
  renterName: z.string().nullable(),
});

export type ShopsBalanceData = z.infer<typeof shopsBalanceSchema>;
//--------------------------------------------------------------------------------------