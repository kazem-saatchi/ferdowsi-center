import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addShopSchema = z.object({
  plaque: z
    .number()
    .min(1, { message: "Plaque must be a positive number greater than zero." }),
  area: z
    .number()
    .min(1, { message: "Area must be a positive number greater than zero." }),
  floor: z.number().int({ message: "Floor must be an integer." }),
  type: z.enum(["STORE","OFFICE"]),
  ownerId: z.string().uuid({ message: "Owner ID must be a valid UUID." }),
  renterId: z
    .string()
    .uuid({ message: "Renter ID must be a valid UUID." })
    .nullable(),
});

export type AddShopData = z.infer<typeof addShopSchema>;
//--------------------------------------------------------------------------------------
export const updateShopInfoSchema = addShopSchema
  .omit({
    ownerId: true,
    renterId: true,
  })
  .extend({ id: z.string() });

export type UpdateShopInfoData = z.infer<typeof updateShopInfoSchema>;
//--------------------------------------------------------------------------------------
export const shopHistoryTypeEnum = z.enum([
  "Ownership",
  "ActiveByOwner",
  "ActiveByRenter",
  "InActive",
]);

export const addShopHistorySchema = z.object({
  shopId: z.string().uuid(),
  personId: z.string().uuid(),
  type: shopHistoryTypeEnum,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export type AddShopHistoryData = z.infer<typeof addShopHistorySchema>;
//--------------------------------------------------------------------------------------
export const updateShopOwner = z.object({
  shopId: z.string(),
  ownerId: z.string(),
  startDate: z.string().datetime(),
});

export type UpdateShopOwnerData = z.infer<typeof updateShopOwner>;
//--------------------------------------------------------------------------------------
export const updateShopRenter = z.object({
  shopId: z.string(),
  renterId: z.string(),
  startDate: z.string().datetime(),
});

export type UpdateShopRenterData = z.infer<typeof updateShopRenter>;
//--------------------------------------------------------------------------------------
export const endShopRenter = z.object({
  shopId: z.string(),
  renterId: z.string(),
  endDate: z.string().datetime(),
});

export type EndShopRenterData = z.infer<typeof endShopRenter>;
//--------------------------------------------------------------------------------------
export const updateShopStatusSchema = z.object({
  shopId: z.string(),
  newStatus: z.enum(["ACTIVATE","INACTIVATE"]),
  date: z.string().datetime(),
});

export type UpdateShopStatusData = z.infer<typeof updateShopStatusSchema>;
//--------------------------------------------------------------------------------------
