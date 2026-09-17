import {
  parseAmount,
  parseBalance,
  parseOptionalInt,
  parseOptionalText,
  parseReference,
  toLatinDigits,
} from "@/utils/bankRowParsing";

describe("parseAmount", () => {
  it("reads a formatted rial figure", () => {
    expect(parseAmount("۱۲,۵۰۰,۰۰۰")).toBe(12_500_000);
    expect(parseAmount("12,500,000")).toBe(12500000);
    expect(parseAmount(" 12500000 ")).toBe(12500000);
    expect(parseAmount(12500000)).toBe(12500000);
  });

  it("treats a blank cell as zero — one of واریز/برداشت is always empty", () => {
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("   ")).toBe(0);
    expect(parseAmount("-")).toBe(0);
    expect(parseAmount("‎")).toBe(0);
  });

  it("keeps a real zero as zero", () => {
    expect(parseAmount("0")).toBe(0);
    expect(parseAmount(0)).toBe(0);
  });

  // The old parseNumber returned 0 here, so the row imported as real money that
  // had vanished. Throwing lets the importer's per-row catch skip and log it.
  it("throws on content it cannot read instead of inventing a zero", () => {
    expect(() => parseAmount("مبلغ")).toThrow();
    expect(() => parseAmount("۱۲۳abc")).toThrow();
    expect(() => parseAmount(NaN)).toThrow();
  });

  // parseFloat("12abc") === 12 — a truncated amount that looks legitimate.
  it("does not silently truncate a partly numeric cell", () => {
    expect(() => parseAmount("12abc")).toThrow();
  });

  it("handles a value past the INT4 ceiling that broke the earlier import", () => {
    expect(parseAmount("2,500,000,000")).toBe(2_500_000_000);
  });
});

describe("parseBalance", () => {
  it("reads the running balance", () => {
    expect(parseBalance("3,120,450")).toBe(3120450);
    expect(parseBalance("0")).toBe(0);
  });

  // A fabricated zero balance would break the duplicate test: two rows sharing
  // amount, date and balance is the proof that one is a re-imported copy.
  it("refuses a blank balance rather than defaulting it to zero", () => {
    expect(() => parseBalance(null)).toThrow();
    expect(() => parseBalance("")).toThrow();
    expect(() => parseBalance("-")).toThrow();
  });
});

describe("parseReference", () => {
  it("keeps the سند exactly as written", () => {
    expect(parseReference("00471")).toBe("00471");
    expect(parseReference(" 12345 ")).toBe("12345");
    expect(parseReference("۹۸۷۶۵")).toBe("98765");
  });

  // This is the defect behind ~91% of net-bank rows carrying "0": an absent
  // reference and a real reference must not collapse to the same value.
  it("returns empty for an absent reference, never '0'", () => {
    expect(parseReference(null)).toBe("");
    expect(parseReference(undefined)).toBe("");
    expect(parseReference("")).toBe("");
    expect(parseReference("-")).toBe("");
    expect(parseReference("‏")).toBe("");
  });

  it("does not lose digits of a reference too long for a float", () => {
    const long = "90071992547409911234";
    expect(parseReference(long)).toBe(long);
    expect(Number(long).toString()).not.toBe(long); // why it stays a string
  });

  it("passes a non-numeric reference through untouched", () => {
    expect(parseReference("TRX-2025-01")).toBe("TRX-2025-01");
  });
});

describe("parseOptionalText", () => {
  it("returns null for blanks, including invisible bidi marks", () => {
    expect(parseOptionalText(null)).toBeNull();
    expect(parseOptionalText("")).toBeNull();
    expect(parseOptionalText("‎")).toBeNull();
    expect(parseOptionalText("  ‏  ")).toBeNull();
  });

  // String(null) === "null" — the old map wrote that literal into چک/قبض.
  it("never produces the string 'null'", () => {
    expect(parseOptionalText(null)).not.toBe("null");
  });

  it("keeps real content", () => {
    expect(parseOptionalText(" 4471 ")).toBe("4471");
  });
});

describe("parseOptionalInt", () => {
  it("returns null for an absent branch code rather than branch 0", () => {
    expect(parseOptionalInt(null)).toBeNull();
    expect(parseOptionalInt("")).toBeNull();
    expect(parseOptionalInt("شعبه")).toBeNull();
  });

  it("reads a branch code", () => {
    expect(parseOptionalInt("1204")).toBe(1204);
    expect(parseOptionalInt("۱۲۰۴")).toBe(1204);
    expect(parseOptionalInt(1204.0)).toBe(1204);
  });
});

describe("toLatinDigits", () => {
  it("converts Persian and Arabic-Indic digits", () => {
    expect(toLatinDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(toLatinDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(toLatinDigits("مانده ۱۲۳")).toBe("مانده 123");
  });
});
