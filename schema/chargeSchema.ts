import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addChargeByShop = z.object({
  month: z.string(), // Month in "YYYY-MM" format
  shopId: z.string(),
  title: z.string()
});

export type AddChargeByShopData = z.infer<typeof addChargeByShop>;
//--------------------------------------------------------------------------------------
