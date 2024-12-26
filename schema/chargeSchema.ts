import { object, z } from "zod";

//--------------------------------------------------------------------------------------
export const addChargeByShopSchema = z.object({
  month: z.string(), // Month in "YYYY-MM" format
  shopId: z.string(),
  title: z.string(),
});

export type AddChargeByShopData = z.infer<typeof addChargeByShopSchema>;
//--------------------------------------------------------------------------------------
export const addChargeAllShopsSchema = z.object({
  month: z.string(), // Month in "YYYY-MM" format
  title: z.string(),
});

export type AddChargeAllShopsData = z.infer<typeof addChargeAllShopsSchema>;
//--------------------------------------------------------------------------------------
export const ShopChargeReferenceSchema = z.object({
  constValue: z.number(),
  metericValue: z.number(),
});

export type ShopChargeReferenceData = z.infer<typeof ShopChargeReferenceSchema>;
//--------------------------------------------------------------------------------------
