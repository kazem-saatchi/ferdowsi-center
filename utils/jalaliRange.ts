/**
 * Bridge between the Jalali date pickers and a BankTransaction date query.
 *
 * The pickers (react-multi-date-picker via JalaliDayCalendar /
 * JalaliMonthCalendar) hand back a JS Date at *local* midnight of the selected
 * day. BankTransaction.date is a `timestamp without time zone` holding *UTC*
 * midnight: the importer formats the Jalali date to "yyyy-MM-dd"
 * (components/upload-file/readFile.ts) and then does `new Date(str)`
 * (app/api/actions/import/addBankData.ts), and JS parses a date-only string as
 * UTC. Every one of the rows on record sits at exactly 00:00:00.
 *
 * Feeding a local-midnight Date straight into the query therefore shifts the
 * window by the viewer's UTC offset — 3.5 hours in Iran. That happens to land
 * on the right side of every boundary for positive offsets, which is why it has
 * never been noticed, but it is wrong for UTC and for any negative offset, and
 * it is wrong the moment a row is stored with a real time of day.
 *
 * These helpers re-read the calendar date off the local Date and rebuild the
 * same day in UTC, so the bound means what the user picked regardless of where
 * the browser is.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** UTC midnight at the start of the calendar day the local `date` falls on. */
export function toUtcDayStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
}

/**
 * UTC midnight of the *following* day — an exclusive upper bound.
 *
 * Prefer this over an inclusive end-of-day: `lt: toUtcNextDayStart(d)` keeps
 * the whole of day `d` no matter what time of day a future row carries.
 */
export function toUtcNextDayStart(date: Date): Date {
  return new Date(toUtcDayStart(date).getTime() + MS_PER_DAY);
}

/**
 * Last representable instant of the calendar day, in UTC.
 *
 * Only for call sites stuck on inclusive (`lte`) bounds; new code should use
 * `toUtcNextDayStart` with `lt` instead.
 */
export function toUtcDayEnd(date: Date): Date {
  return new Date(toUtcNextDayStart(date).getTime() - 1);
}
