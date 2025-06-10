import { z } from "zod";
import { ShopType } from "@prisma/client";

const ShopTypeValues = Object.values(ShopType) as [string, ...string[]];

//--------------------------------------------------------------------------------------
export const addPersonsShopsSchema = z.object({
  plaque: z.number(),
  area: z
    .number()
    .min(1, { message: "Area must be a positive number greater than zero." }),
  floor: z.number().int({ message: "Floor must be an integer." }),
  type: z.enum(ShopTypeValues),
  ownerPhoneOne: z.string(),
  ownerPhoneTwo: z.string().nullable(),
  ownerIdNumber: z.string(),
  ownerFirstName: z.string(),
  ownerLastName: z.string(),
  ownerAddress: z.string(),
  renterPhoneOne: z.string(),
  renterPhoneTwo: z.string().nullable(),
  renterIdNumber: z.string(),
  renterFirstName: z.string(),
  renterLastName: z.string(),
  renterAddress: z.string(),
  ownerBalance: z.number(),
  renterBalance: z.number(),
  ownershipBalance: z.number(),
  bankCardMonthly: z.string(),
  bankCardYearly: z.string(),
});

export type AddPersonsShopsData = z.infer<typeof addPersonsShopsSchema>;
//--------------------------------------------------------------------------------------
export const addkioskSchema = z.object({
  isActive: z.boolean(),
  plaque: z.number(),
  area: z
    .number()
    .min(1, { message: "Area must be a positive number greater than zero." }),
  floor: z.number().int({ message: "Floor must be an integer." }),
  type: z.enum(ShopTypeValues),

  renterPhoneOne: z.string().nullable(),
  renterIdNumber: z.string().nullable(),
  renterFirstName: z.string().nullable(),
  renterLastName: z.string().nullable(),
  renterAddress: z.string().nullable(),
  renterRentBalance: z.number().nullable(),
  renterChargeBalance: z.number().nullable(),
  rentAmount: z.number().nullable(),
  chargeAmount: z.number().nullable(),

  bankCardMonthly: z.string().nullable(),
  bankCardYearly: z.string().nullable(),
});

export type AddKioskData = z.infer<typeof addkioskSchema>;
//--------------------------------------------------------------------------------------
