import { PaymentType } from "@prisma/client";
import { labels } from "@/utils/label";

/** How each payment method reads in lists and filters. */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  CASH: labels.cash,
  CHEQUE: labels.cheque,
  POS_MACHINE: labels.posDevice,
  BANK_TRANSFER: labels.bankTransfer,
  OTHER: labels.otherMethods,
};
