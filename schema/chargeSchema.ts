import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addChargeByShop = z.object({
  fromDate: z.date(),
  toDate: z.date(),
  shopId: z.string(),
  dailyAmount: z.number(),
});

export type AddChargeByShopData = z.infer<typeof addChargeByShop>;
//--------------------------------------------------------------------------------------
