import { toPersianDigits } from "@/utils/formatNumber";

/** Account, card and reference numbers in Persian digits. They render inside
 *  right-to-left text, where "۱۲۳۴-۵۶۷۸" would flip to "۵۶۷۸-۱۲۳۴", so the
 *  number keeps its own left-to-right order. */
export default function LtrDigits({
  value,
}: {
  value: string | number | null | undefined;
}) {
  return (
    <span dir="ltr" className="inline-block">
      {toPersianDigits(value)}
    </span>
  );
}
