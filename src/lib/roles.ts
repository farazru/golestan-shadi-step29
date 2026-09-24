export const ROLE_FA: Record<string, string> = {
  student: "دانش‌آموز",
  teacher: "معلم",
  manager: "مدیر",
  parent: "ولی",
  deputy: "معاون",
};

export function isOffice(role?: string | null) {
  return role === "manager" || role === "deputy";
}

export function isStaff(role?: string | null) {
  return role === "manager" || role === "deputy" || role === "teacher";
}

export function profileMissing(p: {
  dateOfBirth?: string | null;
  address?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
} | null) {
  if (!p) return ["تاریخ تولد", "آدرس", "نام پدر", "تلفن پدر", "نام مادر", "تلفن مادر"];
  const miss: string[] = [];
  if (!p.dateOfBirth) miss.push("تاریخ تولد");
  if (!p.address) miss.push("آدرس");
  if (!p.fatherName) miss.push("نام پدر");
  if (!p.fatherPhone) miss.push("تلفن پدر");
  if (!p.motherName) miss.push("نام مادر");
  if (!p.motherPhone) miss.push("تلفن مادر");
  return miss;
}
