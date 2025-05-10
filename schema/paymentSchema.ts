import { PaymentType as PrismaPaymentType } from "@prisma/client";
import { z } from "zod";

export const PaymentTypeValue = Object.values(PrismaPaymentType) as [
  string,
  ...string[]
];

//--------------------------------------------------------------------------------------
export const addPaymentByInfoSchema = z.object({
  shopId: z.string(),
  personId: z.string(),
  date: z.date(),
  amount: z.number().int().positive(), // Ensures a positive integer
  description: z.string(),
  proprietor: z.boolean(),
  receiptImageUrl: z.string(),
  type: z.enum(PaymentTypeValue),
});

export type AddPaymentByInfoData = z.infer<typeof addPaymentByInfoSchema>;
export type PaymentType = z.infer<typeof addPaymentByInfoSchema>["type"];
//--------------------------------------------------------------------------------------
export const addPaymentByBankIdSchema = addPaymentByInfoSchema
  .extend({
    bankTransactionId: z.string(),
  })
  .omit({
    receiptImageUrl: true,
  });

export type addPaymentByBankIdData = z.infer<typeof addPaymentByBankIdSchema>;
//--------------------------------------------------------------------------------------
