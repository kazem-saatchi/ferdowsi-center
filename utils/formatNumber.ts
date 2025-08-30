export function formatNumber(number: number) {
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
