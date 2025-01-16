import { z } from "zod";

//--------------------------------------------------------------------------------------
export const addPaymentByInfoSchema = z.object({
  shopId: z.string(),
  personId: z.string(),
  date: z.date(),
  amount: z.number().int().positive(), // Ensures a positive integer
  description: z.string().max(250),
  proprietor: z.boolean(),
  receiptImageUrl: z.string(),
  type: z.enum(["CASH","CHEQUE","POS_MACHINE","BANK_TRANSFER","OTHER"])
});

export type AddPaymentByInfoData = z.infer<typeof addPaymentByInfoSchema>;
export type PaymentType = z.infer<typeof addPaymentByInfoSchema>["type"];
//--------------------------------------------------------------------------------------
