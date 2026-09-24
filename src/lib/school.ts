export const SCHOOL = {
  name: "گلستان شادی",
  legalLine: "پیش‌دبستان، دبستان و زبانکده گلستان شادی",
  city: "شهر جدید سهند",
  region: "سهند، تبریز",
  manager: "خانم اسدی",
  phoneMobile: "09144169159",
  phoneLandline: "04133406631",
  instagram: "https://www.instagram.com/golestaneh.shadi.1379",
  instagramHandle: "@golestaneh.shadi.1379",
  mapsUrl: "https://maps.app.goo.gl/HYGeSy1h9Fo8xSio9",
  mapsEmbed:
    "https://maps.google.com/maps?q=%D8%B3%D9%87%D9%86%D8%AF%20%DA%AF%D9%84%D8%B3%D8%AA%D8%A7%D9%86%20%D8%B4%D8%A7%D8%AF%DB%8C&hl=fa&z=16&output=embed",
  address: "شهر جدید سهند — موقعیت دقیق روی نقشه گوگل",
  language: "انگلیسی",
  elementary: "دخترانه",
  preschool: "مختلط",
  languageMix: "مختلط",
  imathPhone: "09144169159",
} as const;

export const TUITION_MONTHS = [
  { key: "prepay", label: "پیش‌پرداخت" },
  { key: "mehr", label: "مهر" },
  { key: "aban", label: "آبان" },
  { key: "azar", label: "آذر" },
  { key: "dey", label: "دی" },
  { key: "bahman", label: "بهمن" },
  { key: "esfand", label: "اسفند" },
  { key: "farvardin", label: "فروردین" },
  { key: "ordibehesht", label: "اردیبهشت" },
  { key: "khordad", label: "خرداد" },
] as const;

export const TUITION_CLASSES = [
  "آمادگی دختر",
  "آمادگی پسر",
  "کلاس اول",
  "کلاس دوم",
  "کلاس سوم",
  "کلاس چهارم",
  "کلاس پنجم",
  "کلاس ششم",
] as const;

export type TuitionClass = (typeof TUITION_CLASSES)[number];

export function isTuitionClass(value: string): value is TuitionClass {
  return (TUITION_CLASSES as readonly string[]).includes(value);
}

export function formatToman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(n)) + " تومان";
}
