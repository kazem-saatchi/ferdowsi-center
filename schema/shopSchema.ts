import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addShopSchema = z.object({
  plaque: z.number(),
  area: z.number(),
  floor:z.number(),
  ownerId: z.string().uuid(),
  renterId: z.string().uuid(),
});

export type AddShopData = z.infer<typeof addShopSchema>;
//--------------------------------------------------------------------------------------
