import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPersonSchema = z.object({
  phoneOne: z.string().regex(/^09[0-9]{9}$/),
  phoneTwo: z
    .string()
    .regex(/^09[0-9]{9}$/)
    .nullable(),
  IdNumber: z.string().length(10),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(5),
});

export type AddPersonData = z.infer<typeof addPersonSchema>;
//--------------------------------------------------------------------------------------
