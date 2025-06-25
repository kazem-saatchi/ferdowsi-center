import { calculateDaysInclusive, calculateOverlappingDays } from "../dateUtils";

// describe("calculateDaysInclusive", () => {
//   it("returns 1 for the same day", () => {
//     const date = new Date("2024-01-01");
//     expect(calculateDaysInclusive(date, date)).toBe(1);
//   });

//   it("returns correct days for consecutive days", () => {
//     const start = new Date("2024-01-01");
//     const end = new Date("2024-01-03");
//     expect(calculateDaysInclusive(start, end)).toBe(3);
//   });

//   it("returns correct days for a month", () => {
//     const start = new Date("2024-01-01");
//     const end = new Date("2024-01-31");
//     expect(calculateDaysInclusive(start, end)).toBe(31);
//   });

//   it("returns 0 if end is before start", () => {
//     const start = new Date("2024-01-05");
//     const end = new Date("2024-01-01");
//     expect(calculateDaysInclusive(start, end)).toBe(0);
//   });

//   it("handles time components correctly", () => {
//     const start = new Date("2024-01-01T23:59:59");
//     const end = new Date("2024-01-02T00:00:01");
//     expect(calculateDaysInclusive(start, end)).toBe(2);
//   });
// });

describe("calculateOverlappingDays", () => {
  const chargeStartDate = new Date("2024-01-01");
  const chargeEndDate = new Date("2024-01-31");

  it("calculates overlapping days for full period match", () => {
    const historyStartDate = new Date("2024-01-01");
    const historyEndDate = new Date("2024-01-31");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(31); // Jan 1-31 (inclusive due to charge end +1)
  });

  it("calculates overlapping days for partial period", () => {
    const historyStartDate = new Date("2024-01-10");
    const historyEndDate = new Date("2024-01-20");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(10); // Jan 10-20 (exclusive history end)
  });

  it("handles history starting before charge period", () => {
    const historyStartDate = new Date("2023-12-25");
    const historyEndDate = new Date("2024-01-15");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(14); // Jan 1-15 (exclusive history end)
  });

  it("handles history ending after charge period", () => {
    const historyStartDate = new Date("2024-01-15");
    const historyEndDate = new Date("2024-02-15");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(17); // Jan 15-31 (inclusive due to charge end +1)
  });

  it("handles null history end date (ongoing history)", () => {
    const historyStartDate = new Date("2024-01-10");
    const historyEndDate = null;

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(22); // Jan 10-31 (inclusive due to charge end +1)
  });

  it("returns 0 when no overlap", () => {
    const historyStartDate = new Date("2024-02-01");
    const historyEndDate = new Date("2024-02-15");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(0);
  });

  it("handles single day overlap", () => {
    const historyStartDate = new Date("2024-01-31");
    const historyEndDate = new Date("2024-02-15");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(1); // Only Jan 31 (inclusive due to charge end +1)
  });

  it("handles history starting after charge period", () => {
    const historyStartDate = new Date("2024-02-01");
    const historyEndDate = new Date("2024-02-15");

    const result = calculateOverlappingDays(
      chargeStartDate,
      chargeEndDate,
      historyStartDate,
      historyEndDate
    );

    expect(result).toBe(0);
  });

  describe("two periods totaling a month with gap between them", () => {
    it("calculates correct days for first period", () => {
      // First period: Jan 1-15 (historyEndDate = Jan 15, will be start of next period)
      const historyStartDate1 = new Date("2024-01-01");
      const historyEndDate1 = new Date("2024-01-15");

      const result1 = calculateOverlappingDays(
        chargeStartDate,
        chargeEndDate,
        historyStartDate1,
        historyEndDate1
      );

      expect(result1).toBe(14); // Jan 1-15 (exclusive history end)
    });

    it("calculates correct days for second period", () => {
      // Second period: Jan 15-31 (historyStartDate = Jan 15, same as previous period's end)
      const historyStartDate2 = new Date("2024-01-15");
      const historyEndDate2 = new Date("2024-01-31");

      const result2 = calculateOverlappingDays(
        chargeStartDate,
        chargeEndDate,
        historyStartDate2,
        historyEndDate2
      );

      expect(result2).toBe(17); // Jan 15-31 (inclusive due to charge end +1)
    });

    it("verifies total days equal charge period", () => {
      // First period: Jan 1-15
      const result1 = calculateOverlappingDays(
        chargeStartDate,
        chargeEndDate,
        new Date("2024-01-01"),
        new Date("2024-01-15")
      );

      // Second period: Jan 15-31
      const result2 = calculateOverlappingDays(
        chargeStartDate,
        chargeEndDate,
        new Date("2024-01-15"),
        new Date("2024-01-31")
      );

      // Total should equal the full charge period
      expect(result1 + result2).toBe(31); // 14 + 17 = 31 (Jan 15 is counted in second period)
      expect(result1).toBe(14);
      expect(result2).toBe(17);
    });
  });
});
