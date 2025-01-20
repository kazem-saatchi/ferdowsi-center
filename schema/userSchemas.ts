import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPersonSchema = z.object({
  phoneOne: z.string(),
  phoneTwo: z.string().nullable(),
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
export const updatePersonSchema = addPersonSchema
  .omit({
    password: true,
  })
  .extend({
    isActive: z.boolean(),
  });

export type updatePersonData = z.infer<typeof updatePersonSchema>;
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
export const updatePersonRoleSchema = z.object({
  userId:z.string(),
  role:z.enum(["ADMIN","MANAGER","STAFF","USER"])
})

export type updatePersonRoleData = z.infer<typeof updatePersonRoleSchema>;
//--------------------------------------------------------------------------------------