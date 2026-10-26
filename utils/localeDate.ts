import { format } from "date-fns-jalali";
import { toPersianDigits } from "./formatNumber";
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

/** The one date format for the UI: Jalali "۱۴۰۵/۰۷/۲۵" in Persian digits.
 *  (formatPersianDate above keeps Latin digits for the Excel exports.) */
export function formatJalaliDate(date: Date | string | number): string {
  return toPersianDigits(format(new Date(date), "yyyy/MM/dd"));
}

/** Jalali date and time, "۱۴۰۵/۰۸/۰۴ ۲۲:۳۵". */
export function formatJalaliDateTime(date: Date | string | number): string {
  return toPersianDigits(format(new Date(date), "yyyy/MM/dd HH:mm"));
}
