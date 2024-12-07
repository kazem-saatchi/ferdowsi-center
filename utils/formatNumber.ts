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
