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
  ownerId: z.string().uuid({ message: "Owner ID must be a valid UUID." }),
  renterId: z
    .string()
    .uuid({ message: "Renter ID must be a valid UUID." })
    .nullable(),
});

export type AddShopData = z.infer<typeof addShopSchema>;
//--------------------------------------------------------------------------------------
