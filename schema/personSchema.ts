import { z } from "zod";
// Type-only import keeps @prisma/client out of the browser bundle: this file is
// reached from client components.
import type { Person } from "@prisma/client";

//--------------------------------------------------------------------------------------
/** A `Person` row as it is allowed to leave the server: every column except the
 *  bcrypt hash. Prisma hands back every scalar unless it is told otherwise, so
 *  each query that produces one of these pairs it with `omit: { password: true }`. */
export type SafePerson = Omit<Person, "password">;

//--------------------------------------------------------------------------------------
export const addPersonSchema = z.object({
  phoneOne: z.string(),
  phoneTwo: z.string().nullable(),
  IdNumber: z.string(),
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

export type FindPersonByIdData = z.infer<typeof findPersonByIdSchema>;
//--------------------------------------------------------------------------------------
export const updatePersonSchema = addPersonSchema
  .omit({
    password: true,
  })
  .extend({
    isActive: z.boolean(),
    id: z.string(),
  });

export type UpdatePersonData = z.infer<typeof updatePersonSchema>;
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
  userId: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "USER"]),
});

export type UpdatePersonRoleData = z.infer<typeof updatePersonRoleSchema>;
//--------------------------------------------------------------------------------------
export const updatePersonPassword = z.object({
  userId: z.string(),
  password: z.string().min(8),
  currentPassword: z.string(),
});

export type UpdatePersonPasswordData = z.infer<typeof updatePersonPassword>;
//--------------------------------------------------------------------------------------
export const personInfoSafeSchema = addPersonSchema.omit({
  IdNumber: true,
  password: true,
  phoneTwo: true,
});

export type PersonInfoSafe = z.infer<typeof personInfoSafeSchema>;
//--------------------------------------------------------------------------------------
