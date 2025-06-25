import { differenceInDays, startOfDay, addDays } from "date-fns";

export function calculateDaysInclusive(start: Date, end: Date) {
  const startDay = startOfDay(start);
  const endDay = addDays(startOfDay(end), 1);
  const diff = differenceInDays(endDay, startDay);
  return diff < 0 ? 0 : diff;
}

export function calculateOverlappingDays(
  chargeStartDate: Date,
  chargeEndDate: Date,
  historyStartDate: Date | null,
  historyEndDate: Date | null
) {
  // Only add one day to the charge end date (total period end)
  const chargeStart = startOfDay(chargeStartDate);
  const chargeEnd = addDays(startOfDay(chargeEndDate), 1); // Add one day to charge end date

  // History dates should NOT get +1 day since they will be counted in next period
  const historyStart = historyStartDate
    ? startOfDay(historyStartDate)
    : chargeStart;

  // Special cases for history end date:
  // 1. If history end equals charge end, use inclusive charge end
  // 2. If history end is after charge end, use inclusive charge end
  // 3. Otherwise, use exclusive history end
  const historyEnd = historyEndDate
    ? historyEndDate.getTime() === chargeEndDate.getTime() ||
      historyEndDate > chargeEndDate
      ? chargeEnd // Use inclusive charge end if dates are equal or history extends beyond
      : startOfDay(historyEndDate) // Use exclusive history end
    : chargeEnd;

  // Calculate the effective start and end dates for the overlap
  const effectiveStart =
    chargeStart > historyStart ? chargeStart : historyStart;
  const effectiveEnd = historyEnd < chargeEnd ? historyEnd : chargeEnd;

  const diff = differenceInDays(effectiveEnd, effectiveStart);
  return diff < 0 ? 0 : diff;
}
