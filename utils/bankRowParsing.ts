/**
 * Cell parsers for the bank statement importers.
 *
 * These replace a single `parseNumber` that ran every cell — amounts, the
 * reference number (سند), the branch code — through `parseFloat` and returned
 * `0` whenever that failed. Three separate defects came out of that:
 *
 *  1. An unreadable amount became `0` and imported as a real row. Money silently
 *     disappeared from the statement instead of the import complaining.
 *  2. An absent reference number became `0`, which is why ~91% of net-bank rows
 *     carry `bankReferenceId = "0"`. Two unrelated transactions then share the
 *     same "reference", and the identity hash loses a field's worth of power.
 *  3. `parseFloat` is lenient — `"12abc"` yields `12`, and a reference longer
 *     than 2^53 loses its last digits to float precision.
 *
 * The rule here: a blank cell is a fact (no deposit, no branch, no cheque) and
 * maps to the honest empty value; a cell with content that cannot be read is an
 * error and throws, so the importer's per-row `try/catch` skips and logs it
 * rather than writing a fabricated number.
 */

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits, which `Number()` rejects. */
const EASTERN_DIGITS = /[۰-۹٠-٩]/g;

/**
 * Bidi marks, zero-width joiners and the BOM. They arrive from the bank's RTL
 * exports, render as nothing, and make a cell that looks empty non-empty —
 * `chequeNumber` fields holding a lone U+200E are the common case.
 */
const INVISIBLE_MARKS = /[​-‏‪-‮⁦-⁩﻿]/g;

/** Cell contents the statements use to mean "nothing here". */
const BLANK_PLACEHOLDERS = new Set(["", "-", "--", "—", "–", ".", "/"]);

export function toLatinDigits(text: string): string {
  return text.replace(EASTERN_DIGITS, (digit) => {
    const code = digit.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/** Trims a cell to its meaningful content: `""` for anything blank. */
function normalise(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).replace(INVISIBLE_MARKS, "").trim();
  return BLANK_PLACEHOLDERS.has(text) ? "" : text;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const text = toLatinDigits(normalise(value)).replace(/,/g, "");
  if (text === "") return null;
  const parsed = Number(text);
  // `Number` rather than `parseFloat`: `parseFloat("12abc")` is 12, which would
  // import a truncated amount as if it were the real one.
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * واریز / برداشت. One of the two is always blank on a statement row, so blank
 * legitimately means zero; unreadable content throws.
 */
export function parseAmount(value: unknown): number {
  const parsed = toNumber(value);
  if (parsed === null) {
    if (normalise(value) === "") return 0;
    throw new Error(`مبلغ نامعتبر در فایل بانک: «${String(value)}»`);
  }
  return parsed;
}

/**
 * مانده. Unlike an amount, a blank balance is never legitimate — and a zero
 * written in its place is worse than a missing row, because the running balance
 * is what proves whether two similar rows are one transaction imported twice.
 */
export function parseBalance(value: unknown): number {
  const parsed = toNumber(value);
  if (parsed === null) {
    throw new Error(`مانده نامعتبر در فایل بانک: «${String(value)}»`);
  }
  return parsed;
}

/**
 * شماره سند. Kept as a string and never number-parsed: leading zeros survive,
 * a reference too long for a float keeps its last digits, and an absent one
 * stays `""` instead of colliding with every other absent one on `"0"`.
 */
export function parseReference(value: unknown): string {
  return toLatinDigits(normalise(value)).replace(/,/g, "");
}

/** شماره قبض / شماره چک — nullable columns, so blank maps to `null`. */
export function parseOptionalText(value: unknown): string | null {
  const text = normalise(value);
  return text === "" ? null : text;
}

/** کد شعبه — a nullable `Int?`, so blank is `null`, not branch number zero. */
export function parseOptionalInt(value: unknown): number | null {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}
