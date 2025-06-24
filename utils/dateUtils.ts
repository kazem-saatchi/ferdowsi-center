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
  historyStartDate: Date,
  historyEndDate: Date | null
) {
  const chargeStart = startOfDay(chargeStartDate);
  const chargeEnd = addDays(startOfDay(chargeEndDate), 1); // Add one day to charge end date
  const historyStart = startOfDay(historyStartDate);
  const historyEnd = historyEndDate
    ? addDays(startOfDay(historyEndDate), 1) // Add one day to history end date if not null
    : chargeEnd; // Use charge end if history end is null

  // Calculate the effective start and end dates for the overlap
  const effectiveStart =
    chargeStart > historyStart ? chargeStart : historyStart;
  const effectiveEnd = historyEnd < chargeEnd ? historyEnd : chargeEnd;

  const diff = differenceInDays(effectiveEnd, effectiveStart);
  return diff < 0 ? 0 : diff;
}
