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
export const aggregatedAmountSchema = z.object({
  proprietor: z.boolean(),
  total: z.number(),
});

export type AggregatedAmount = z.infer<typeof aggregatedAmountSchema>;
//--------------------------------------------------------------------------------------
export const rawShopBalanceDataSchema = z.object({
  shopId: z.string(),
  plaque: z.number(),
  ownerName: z.string(),
  renterName: z.string().nullable(),
  ownerId: z.string(),
  renterId: z.string().nullable(),
  type: z.enum(["STORE", "OFFICE", "KIOSK", "PARKING", "BOARD"]),
  charges: z.array(aggregatedAmountSchema),
  payments: z.array(aggregatedAmountSchema),
});

export type RawShopBalanceData = z.infer<typeof rawShopBalanceDataSchema>;
//--------------------------------------------------------------------------------------
export const transactionSchema = z.object({
  amount: z.number(),
  personId: z.string(),
  proprietor: z.boolean(),
});

export type Transaction = z.infer<typeof transactionSchema>;
//--------------------------------------------------------------------------------------
export const rawTransactionShopDataSchema = z.object({
  shopId: z.string(),
  plaque: z.number(),
  ownerName: z.string(),
  renterName: z.string().nullable(),
  ownerId: z.string(),
  renterId: z.string().nullable(),
  type: z.enum(["STORE", "OFFICE", "KIOSK", "PARKING", "BOARD"]),
  charges: z.array(transactionSchema),
  payments: z.array(transactionSchema),
});

export type RawTransactionShopData = z.infer<
  typeof rawTransactionShopDataSchema
>;
//--------------------------------------------------------------------------------------
export const shopBalanceDetailsSchema = z.object({
  plaque: z.number(),
  ownerName: z.string(),
  renterName: z.string().nullable(),
  totalBalance: z.number(),
  ownerBalance: z.number(),
  renterBalance: z.number(),
});

export type ShopBalanceDetails = z.infer<typeof shopBalanceDetailsSchema>;
//--------------------------------------------------------------------------------------
