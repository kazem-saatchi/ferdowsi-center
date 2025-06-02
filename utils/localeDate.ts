import { format } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";

export function formatPersianDate(date: Date): string {
  return format(date, "yyyy/MM/dd", { locale: faIR });
}

