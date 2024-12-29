import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addChargeByShopSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  title: z.string(),
});

export type AddChargeByShopData = z.infer<typeof addChargeByShopSchema>;
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
