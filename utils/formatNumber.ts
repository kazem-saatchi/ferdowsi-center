export function formatNumber(number: number | bigint) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  // Insert commas in the English number
  const formattedEnglishNumber = number
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Convert back to Persian digits
  let formattedPersianNumber = "";
  for (let char of formattedEnglishNumber) {
    const index = englishDigits.indexOf(char);
    formattedPersianNumber += index !== -1 ? persianDigits[index] : char;
  }

  return formattedPersianNumber;
}

export function formatNumberFromString(value: string): {
  formattedPersianNumber: string;
  formattedNumber: string;
} {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  // Remove commas for revalidation
  let cleanValue = value.replace(/,/g, "");

  // Convert From Persian to English
  let formattedNumber = "";
  for (let char of cleanValue) {
    const index = persianDigits.indexOf(char);
    formattedNumber += index !== -1 ? englishDigits[index] : char;
  }

  // Ensure the cleaned string is numeric
  if (!/^\d*$/.test(formattedNumber)) {
    return { formattedPersianNumber: formattedNumber, formattedNumber }; // Return original value if it's not a valid number
  }

  // Insert commas in the English number
  const formattedEnglishNumber = formattedNumber.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Convert back to Persian digits (if needed)
  let formattedPersianNumber = "";
  for (let char of formattedEnglishNumber) {
    const index = englishDigits.indexOf(char);
    formattedPersianNumber += index !== -1 ? persianDigits[index] : char;
  }

  return { formattedPersianNumber, formattedNumber }; // Return the formatted Persian number
}

export function convertToEnglishNumber(value: string): string { 
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  let formattedNumber = "";
  for (let char of value) {
    const index = persianDigits.indexOf(char);
    formattedNumber += index !== -1 ? englishDigits[index] : char;
  }
  return formattedNumber;
}

/** Swap Latin digits for Persian ones in any value (plaque, floor, national
 *  ID, phone, page number). Leaves everything else untouched, so it is safe
 *  on mixed text such as "شارژ آبان 1405". */
export function toPersianDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Amount with grouping and the currency unit, e.g. "۱۲,۵۰۰ ریال". */
export function formatRial(amount: number | bigint): string {
  return `${formatNumber(amount)} ریال`;
}

/** Search key that ignores how a digit or letter was typed: Persian (۱۲۳) and
 *  Arabic (١٢٣) digits become Latin, Arabic ي/ك become Persian ی/ک, and case is
 *  folded. Apply it to both the query and the text being searched. */
export function normalizeForSearch(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .toLowerCase();
}

/** Clean what was typed into a number field: any digit script becomes Latin,
 *  separators and stray characters go. Keeps one decimal point (Persian "٫"
 *  counts) with `allowDecimal`, and a leading minus with `allowNegative`.
 *  Returns "" for an empty field. */
export function parseNumericInput(
  value: string,
  { allowDecimal = false, allowNegative = false } = {}
): string {
  const latin = normalizeForSearch(value).replace(/٫/g, ".").trim();
  const sign = allowNegative && /^[-−]/.test(latin) ? "-" : "";
  if (!allowDecimal) return sign + latin.replace(/\D/g, "");
  const [whole, ...rest] = latin.replace(/[^\d.]/g, "").split(".");
  return sign + (rest.length ? `${whole}.${rest.join("")}` : whole);
}

/** The display side of parseNumericInput: "1234567.5" → "۱,۲۳۴,۵۶۷.۵".
 *  Pass `grouping: false` for identifiers such as a plaque. */
export function formatNumericInput(value: string, grouping = true): string {
  const sign = value.startsWith("-") ? "-" : "";
  const [whole, fraction] = value.slice(sign.length).split(".");
  const grouped = !grouping ? whole : whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    sign +
    toPersianDigits(fraction === undefined ? grouped : `${grouped}.${fraction}`)
  );
}
