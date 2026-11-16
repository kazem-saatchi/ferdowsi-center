import {
  allocateByDays,
  billingWindowDays,
  countBillableDays,
  prorateWindow,
  segmentWindowBySpans,
  toBillingDay,
} from "@/app/api/actions/charge/utils";
import { addDays } from "date-fns";

jest.mock("@/lib/db", () => ({
  db: {
    shopHistory: {
      findMany: jest.fn(),
    },
  },
}));

/**
 * A billing day: UTC midnight of the date, which is what `toBillingDay`
 * returns for that Tehran calendar day. Independent of the machine's zone.
 */
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** The 31-day window every other charge test uses (مرداد 1404). */
const WINDOW = { startDate: d("2025-07-22"), endDate: d("2025-08-21") };

const span = (startDate: string, endDate: string | null) => ({
  startDate: d(startDate),
  endDate: endDate ? d(endDate) : null,
});

describe("billingWindowDays", () => {
  it("counts the window's end date as a billed day", () => {
    // The window is closed: both 22 Jul and 21 Aug are billed.
    expect(billingWindowDays(WINDOW)).toBe(31);
  });

  it("counts a single-day window as one day", () => {
    expect(
      billingWindowDays({ startDate: d("2025-07-22"), endDate: d("2025-07-22") })
    ).toBe(1);
  });
});

describe("countBillableDays", () => {
  it("bills the whole window for a span that swallows it", () => {
    expect(countBillableDays(span("2024-01-01", null), WINDOW)).toBe(31);
  });

  it("treats a null end date as still open, so it runs to the window's end", () => {
    expect(countBillableDays(span("2025-08-16", null), WINDOW)).toBe(6);
  });

  it("does not bill the span's own end date, which belongs to the next occupant", () => {
    // Half-open [start, end): 22 Jul .. 15 Aug inclusive = 25 days, NOT 26.
    expect(countBillableDays(span("2024-01-01", "2025-08-16"), WINDOW)).toBe(25);
  });

  it("returns zero for a span that ends on the first day of the window", () => {
    // Its last billed day would be 21 Jul, which is outside the window.
    expect(countBillableDays(span("2024-01-01", "2025-07-22"), WINDOW)).toBe(0);
  });

  it("returns zero for a span that starts after the window", () => {
    expect(countBillableDays(span("2025-08-22", null), WINDOW)).toBe(0);
  });

  it("returns zero for a span that ended before the window", () => {
    expect(countBillableDays(span("2024-01-01", "2025-07-01"), WINDOW)).toBe(0);
  });

  it("bills a single day for a span covering only the window's last day", () => {
    expect(countBillableDays(span("2025-08-21", "2025-08-22"), WINDOW)).toBe(1);
  });

  it("ignores the time of day on either side", () => {
    const noisy = {
      startDate: new Date("2025-08-16T20:15:00Z"), // 16 Aug 23:45 Tehran
      endDate: new Date("2025-08-19T21:00:00Z"), // 20 Aug 00:30 Tehran
    };
    expect(countBillableDays(noisy, WINDOW)).toBe(4);
  });
});

describe("the handover day", () => {
  /**
   * The 32-days-in-a-31-day-month bug: updateShopRenter closes the outgoing
   * span on the SAME date the incoming one starts, so a `+ 1` on both sides
   * billed that date twice — to two different people.
   */
  const HANDOVER = "2025-08-16";
  const outgoing = span("2024-01-01", HANDOVER);
  const incoming = span(HANDOVER, null);

  it("splits the window into day counts that sum to exactly the window length", () => {
    const owner = countBillableDays(outgoing, WINDOW);
    const renter = countBillableDays(incoming, WINDOW);

    expect(owner).toBe(25);
    expect(renter).toBe(6);
    expect(owner + renter).toBe(billingWindowDays(WINDOW));
  });

  it("gives the shared date to the incoming occupant only", () => {
    const [outSeg, inSeg] = segmentWindowBySpans([outgoing, incoming], WINDOW);

    // The outgoing slice runs from the window start up to — but not including
    // — the handover date, so its last billed day is 15 Aug.
    expect(outSeg.startDate).toEqual(d("2025-07-22"));
    expect(addDays(outSeg.startDate, outSeg.days)).toEqual(d(HANDOVER));

    // The incoming slice begins ON the handover date.
    expect(inSeg.startDate).toEqual(d(HANDOVER));
  });

  it.each([
    ["2025-07-23", 1, 30],
    ["2025-08-01", 10, 21],
    ["2025-08-17", 26, 5],
    ["2025-08-21", 30, 1],
  ])(
    "never over- or under-counts when the handover lands on %s",
    (handover, outDays, inDays) => {
      const out = countBillableDays(span("2024-01-01", handover), WINDOW);
      const incoming = countBillableDays(span(handover, null), WINDOW);

      expect(out).toBe(outDays);
      expect(incoming).toBe(inDays);
      expect(out + incoming).toBe(31);
    }
  );

  it("keeps a three-way handover inside the window length too", () => {
    const spans = [
      span("2024-01-01", "2025-08-01"),
      span("2025-08-01", "2025-08-16"),
      span("2025-08-16", null),
    ];

    const days = spans.map((s) => countBillableDays(s, WINDOW));

    expect(days).toEqual([10, 15, 6]);
    expect(days.reduce((a, b) => a + b, 0)).toBe(31);
  });
});

describe("days are Tehran calendar days, whatever the server's time zone", () => {
  /**
   * Real values from اردیبهشت 1404 (31 days, 1 Ordibehesht = 21 Apr 2025).
   *
   * The month picker hands over Tehran MIDNIGHT, which is 20:30 UTC on the
   * PREVIOUS Gregorian day. The day picker keeps the time of day it was picked
   * at, here 20:20 Tehran. A server running in UTC used to truncate both to the
   * UTC day, so the window started on 20 Apr while the handover stayed on
   * 21 Apr — and the outgoing occupant was billed one day they never held.
   *
   * Run this file with TZ=UTC as well as TZ=Asia/Tehran: it must pass in both.
   */
  const ORDIBEHESHT_1404 = {
    startDate: new Date("2025-04-20T20:30:00Z"), // 1404/02/01 00:00 Tehran
    endDate: new Date("2025-05-20T20:30:00Z"), // 1404/02/31 00:00 Tehran
  };
  const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

  it("counts a 31-day Jalali month as 31 days", () => {
    expect(billingWindowDays(ORDIBEHESHT_1404)).toBe(31);
  });

  it("bills nothing to the outgoing occupant when the handover is on the 1st", () => {
    const handover = new Date("2025-04-21T16:50:00Z"); // 1404/02/01 20:20 Tehran
    const segments = prorateWindow(
      [
        { startDate: utcDay("2024-01-01"), endDate: handover },
        { startDate: handover, endDate: null },
      ],
      ORDIBEHESHT_1404,
      12_500_000
    );

    expect(segments).toHaveLength(1);
    expect(segments[0].days).toBe(31);
    expect(segments[0].amount).toBe(12_500_000);
    expect(segments[0].startDate).toEqual(utcDay("2025-04-21"));
  });

  it("splits a mid-month handover on the picked Tehran day", () => {
    const handover = new Date("2025-04-30T16:51:00Z"); // 1404/02/10 20:21 Tehran
    const days = prorateWindow(
      [
        { startDate: utcDay("2024-01-01"), endDate: handover },
        { startDate: handover, endDate: null },
      ],
      ORDIBEHESHT_1404,
      12_500_000
    ).map((s) => s.days);

    // 1st..9th to the outgoing occupant, 10th..31st to the incoming one.
    expect(days).toEqual([9, 22]);
  });

  it("bills the last day of the month to an occupant who starts on it", () => {
    const handover = new Date("2025-05-21T16:55:00Z"); // 1404/02/31 20:25 Tehran
    const days = prorateWindow(
      [
        { startDate: utcDay("2024-01-01"), endDate: handover },
        { startDate: handover, endDate: null },
      ],
      ORDIBEHESHT_1404,
      12_500_000
    ).map((s) => s.days);

    expect(days).toEqual([30, 1]);
  });

  it("puts a time just after Tehran midnight on the Tehran day, not the UTC one", () => {
    // 1404/02/11 00:15 Tehran is still 10 Ordibehesht in UTC.
    expect(toBillingDay(new Date("2025-04-30T20:45:00Z"))).toEqual(
      utcDay("2025-05-01")
    );
  });
});

describe("allocateByDays", () => {
  it("writes whole Rials only — Charge.amount is an Int column", () => {
    // 11,600,000 / 31 is not an integer, and nor is any partial slice of it.
    const split = allocateByDays([{ days: 25 }, { days: 6 }], 31, 11_600_000);

    for (const segment of split) {
      expect(Number.isInteger(segment.amount)).toBe(true);
    }
  });

  it("sums to the reference total exactly when the spans cover the window", () => {
    const split = allocateByDays([{ days: 25 }, { days: 6 }], 31, 11_600_000);

    expect(split.map((s) => s.amount)).toEqual([9_354_839, 2_245_161]);
    expect(split.reduce((sum, s) => sum + s.amount, 0)).toBe(11_600_000);
  });

  it.each([
    [[1, 30]],
    [[10, 21]],
    [[26, 5]],
    [[15, 15, 1]],
    [[1, 1, 1, 28]],
    [[7, 8, 8, 8]],
  ])("holds the money invariant for a %s-day split", (parts) => {
    const totalDays = parts.reduce((a, b) => a + b, 0);
    const split = allocateByDays(
      parts.map((days) => ({ days })),
      totalDays,
      11_600_000
    );

    expect(split.reduce((sum, s) => sum + s.amount, 0)).toBe(11_600_000);
    expect(split.every((s) => Number.isInteger(s.amount))).toBe(true);
  });

  it("bills only the covered part when the window is partly vacant", () => {
    // 20 of 31 days occupied: rounding drift must not top the bill up to a
    // full month. 20 * 11,600,000 / 31 = 7,483,870.96…
    const split = allocateByDays([{ days: 20 }], 31, 11_600_000);

    expect(split[0].amount).toBe(7_483_871);
  });

  it("yields nothing to allocate when the window has no days", () => {
    expect(allocateByDays([{ days: 5 }], 0, 11_600_000)).toEqual([
      { days: 5, amount: 0 },
    ]);
  });

  it("preserves the caller's own fields", () => {
    const split = allocateByDays([{ days: 31, personId: "owner-1" }], 31, 100);

    expect(split[0]).toEqual({ days: 31, personId: "owner-1", amount: 100 });
  });
});

describe("prorateWindow", () => {
  it("drops the spans that cover no day of the window", () => {
    const segments = prorateWindow(
      [
        span("2024-01-01", "2025-07-01"), // ended before the window
        span("2024-01-01", "2025-08-16"), // the owner
        span("2025-08-16", null), // the renter
        span("2025-09-01", null), // starts after the window
      ],
      WINDOW,
      11_600_000
    );

    expect(segments.map((s) => s.days)).toEqual([25, 6]);
  });

  it("splits a month with a mid-month handover without creating money", () => {
    const segments = prorateWindow(
      [span("2024-01-01", "2025-08-16"), span("2025-08-16", null)],
      WINDOW,
      11_600_000
    );

    expect(segments.reduce((sum, s) => sum + s.days, 0)).toBe(31);
    expect(segments.reduce((sum, s) => sum + s.amount, 0)).toBe(11_600_000);
  });

  it("returns nothing when no span overlaps the window", () => {
    expect(prorateWindow([span("2025-09-01", null)], WINDOW, 11_600_000)).toEqual(
      []
    );
  });

  it("honours an explicit totalDays, as the generators pass it", () => {
    // getRelatedHistories is the authority on the window length; the helper
    // must not quietly recompute a different one.
    const segments = prorateWindow(
      [span("2024-01-01", null)],
      WINDOW,
      11_600_000,
      31
    );

    expect(segments[0].days).toBe(31);
    expect(segments[0].amount).toBe(11_600_000);
  });
});
