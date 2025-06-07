import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addChargeByShopSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  title: z.string(),
  shopId: z.string(),
});

export type AddChargeByShopData = z.infer<typeof addChargeByShopSchema>;
//--------------------------------------------------------------------------------------
export const addChargeByAmountSchema = z.object({
  date: z.date(),
  amount: z.number(),
  title: z.string(),
  shopId: z.string(),
  personId: z.string(),
  proprietor: z.boolean(),
  description: z.string().max(250),
});

export type AddChargeByAmountData = z.infer<typeof addChargeByAmountSchema>;
//--------------------------------------------------------------------------------------
export const addChargeAllShopsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  title: z.string(),
});

export type AddChargeAllShopsData = z.infer<typeof addChargeAllShopsSchema>;
//--------------------------------------------------------------------------------------
export const addRentAllKiosksSchema = addChargeAllShopsSchema;
export type AddRentAllKiosksData = z.infer<typeof addRentAllKiosksSchema>;
//--------------------------------------------------------------------------------------
export const ShopChargeReferenceSchema = z.object({
  storeConst: z.number(),
  storeMetric: z.number(),
  officeConst: z.number(),
  officeMetric: z.number(),
  savingPercent: z.number(),
});

export type ShopChargeReferenceData = z.infer<typeof ShopChargeReferenceSchema>;
//--------------------------------------------------------------------------------------
export const ShopAnnualChargeReferenceSchema = z.object({
  storeMetric: z.number(),
  officeMetric: z.number(),
});

export type ShopAnnualChargeReferenceData = z.infer<
  typeof ShopAnnualChargeReferenceSchema
>;
//--------------------------------------------------------------------------------------
export const getChargeByShopSchema = z.object({
  shopId: z.string(),
});

export type GetChargeByShopData = z.infer<typeof getChargeByShopSchema>;
//--------------------------------------------------------------------------------------
export const getChargeByPersonSchema = z.object({
  personId: z.string(),
});

export type GetChargeByPersonData = z.infer<typeof getChargeByPersonSchema>;
//--------------------------------------------------------------------------------------
export const addAnnualChargeAllShopsSchema = z.object({
  year: z.string(),
  title: z.string(),
  storeMetric: z.number(),
  officeMetric: z.number(),
});

export type AddAnnualChargeAllShopsData = z.infer<
  typeof addAnnualChargeAllShopsSchema
>;
//--------------------------------------------------------------------------------------
