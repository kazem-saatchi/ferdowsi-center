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
export const findPersonByIdSchema = addPersonSchema.omit({
  firstName: true,
  lastName: true,
  password: true,
  phoneOne: true,
  phoneTwo: true,
});

export type findPersonByIdData = z.infer<typeof findPersonByIdSchema>;
//--------------------------------------------------------------------------------------
export const findPersonByFilterSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneOne: z.string().optional(),
  phoneTwo: z.string().optional(),
  IdNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type FindPersonByFilterData = z.infer<typeof findPersonByFilterSchema>;
//--------------------------------------------------------------------------------------
