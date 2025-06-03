import { format } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";

export function formatPersianDate(date: Date): string {
  return format(date, "yyyy/MM/dd", { locale: faIR });
}

export function currentJalaliYear(): { toString: string; toNumber: number } {
  return {
    toString: format(new Date(), "yyyy", { locale: faIR }),
    toNumber: parseInt(format(new Date(), "yyyy", { locale: faIR })),
  };
}
