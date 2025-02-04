import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPersonsShopsSchema = z.object({
  plaque: z.number(),
  area: z
    .number()
    .min(1, { message: "Area must be a positive number greater than zero." }),
  floor: z.number().int({ message: "Floor must be an integer." }),
  
});
