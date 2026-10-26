import { matchesSearch, paginate } from "@/utils/listSearch";
import {
  ledgerDateCondition,
  ledgerSearchConditions,
  sanitizePaging,
} from "@/utils/ledgerListQuery";

describe("matchesSearch", () => {
  const row = ["علی", "احمدی", "0012345678", "09121234567", 102];

  it("matches everything for an empty query", () => {
    expect(matchesSearch("", row)).toBe(true);
    expect(matchesSearch("   ", row)).toBe(true);
  });

  it("matches digits typed in Persian against Latin data and back", () => {
    expect(matchesSearch("۰۹۱۲", row)).toBe(true);
    expect(matchesSearch("102", ["۱۰۲"])).toBe(true);
  });

  it("treats Arabic ي and ك as their Persian forms", () => {
    expect(matchesSearch("علي", row)).toBe(true);
    expect(matchesSearch("كاظمی", ["کاظمی"])).toBe(true);
  });

  it("needs every word to match some field", () => {
    expect(matchesSearch("علی ۱۰۲", row)).toBe(true);
    expect(matchesSearch("علی ۹۹۹", row)).toBe(false);
  });

  it("skips empty fields", () => {
    expect(matchesSearch("x", [null, undefined, ""])).toBe(false);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("slices the requested page", () => {
    expect(paginate(items, 2, 10)).toEqual({
      page: 2,
      totalPages: 3,
      items: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    });
  });

  it("clamps a page past the end, e.g. after a filter shrank the list", () => {
    expect(paginate(items, 9, 25).page).toBe(2);
    expect(paginate([], 3, 25)).toEqual({ page: 1, totalPages: 1, items: [] });
  });
});

describe("sanitizePaging", () => {
  it("keeps a valid page and size", () => {
    expect(sanitizePaging(3, 50)).toEqual({ page: 3, limit: 50, skip: 100 });
  });

  it("refuses sizes outside the picker and bad pages", () => {
    expect(sanitizePaging(0, 100000)).toEqual({ page: 1, limit: 25, skip: 0 });
    expect(sanitizePaging(1.5, 10).page).toBe(1);
  });
});

describe("ledgerSearchConditions", () => {
  it("returns no conditions for an empty search", () => {
    expect(ledgerSearchConditions("")).toEqual([]);
    expect(ledgerSearchConditions(undefined)).toEqual([]);
  });

  it("looks for a number as a plaque and in both digit scripts", () => {
    const [condition] = ledgerSearchConditions("۱۰۲");
    expect(condition.OR).toContainEqual({ plaque: 102 });
    expect(condition.OR).toContainEqual({
      title: { contains: "102", mode: "insensitive" },
    });
    expect(condition.OR).toContainEqual({
      title: { contains: "۱۰۲", mode: "insensitive" },
    });
  });

  it("does not try a word as a plaque", () => {
    const [condition] = ledgerSearchConditions("رضا");
    expect(condition.OR.some((c) => "plaque" in c)).toBe(false);
  });

  it("gives one condition per word", () => {
    expect(ledgerSearchConditions("رضا ۱۰۲")).toHaveLength(2);
  });
});

describe("ledgerDateCondition", () => {
  it("is undefined without a month", () => {
    expect(ledgerDateCondition()).toBeUndefined();
  });

  it("uses an inclusive start and exclusive end", () => {
    const from = new Date("2026-09-22T20:30:00Z");
    const to = new Date("2026-10-22T20:30:00Z");
    expect(ledgerDateCondition(from, to)).toEqual({ gte: from, lt: to });
  });
});
