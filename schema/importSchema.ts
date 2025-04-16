import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPersonsShopsSchema = z.object({
  plaque: z.number(),
  area: z
    .number()
    .min(1, { message: "Area must be a positive number greater than zero." }),
  floor: z.number().int({ message: "Floor must be an integer." }),
  type: z.enum(["STORE", "OFFICE", "KIOSK"]),
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
