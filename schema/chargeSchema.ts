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
export const addChargeByAmount = z.object({
  date: z.date(),
  amount: z.number(),
  title: z.string(),
  shopId: z.string(),
});

export type AddChargeByAmount = z.infer<typeof addChargeByAmount>;
//--------------------------------------------------------------------------------------
export const addChargeAllShopsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  title: z.string(),
});

export type AddChargeAllShopsData = z.infer<typeof addChargeAllShopsSchema>;
//--------------------------------------------------------------------------------------
export const ShopChargeReferenceSchema = z.object({
  storeConst: z.number(),
  storeMetric: z.number(),
  officeConst: z.number(),
  officeMetric: z.number(),
});

export type ShopChargeReferenceData = z.infer<typeof ShopChargeReferenceSchema>;
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
