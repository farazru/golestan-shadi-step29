// Convert Persian / Arabic-Indic digits to Latin so کد ملی validation
// accepts values typed with a Persian keyboard (e.g. ۱۰۴۳۲ → 10432).
const DIGIT_MAP: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export function toLatinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => DIGIT_MAP[ch] ?? ch);
}

export function normalizeIdNumber(value: string) {
  return toLatinDigits(value).replace(/\D/g, "");
}

export function isNationalId(value: string) {
  return /^\d{10}$/.test(normalizeIdNumber(value));
}
