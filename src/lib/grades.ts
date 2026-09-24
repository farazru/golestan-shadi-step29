// The six elementary grade levels. Used as the single source of truth
// anywhere a grade needs to be picked (course creation, student profile),
// so nobody can typo a grade name and accidentally make a course invisible
// to the right students.
export const GRADE_LEVELS = [
  "اول ابتدایی",
  "دوم ابتدایی",
  "سوم ابتدایی",
  "چهارم ابتدایی",
  "پنجم ابتدایی",
  "ششم ابتدایی",
] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];

export function isGradeLevel(value: string): value is GradeLevel {
  return (GRADE_LEVELS as readonly string[]).includes(value);
}

// Standard subject titles per grade, per Iran's elementary curriculum.
// These are SUGGESTIONS (via a datalist, not a locked dropdown) — a
// teacher can still type a custom title for anything non-standard
// (an extracurricular, a specific section name, etc).
const CORE_SUBJECTS = ["فارسی", "نگارش", "ریاضی", "علوم تجربی", "هدیه‌های آسمانی", "قرآن", "هنر", "تربیت‌بدنی"];

export const GRADE_SUBJECTS: Record<GradeLevel, string[]> = {
  "اول ابتدایی": CORE_SUBJECTS,
  "دوم ابتدایی": CORE_SUBJECTS,
  "سوم ابتدایی": [...CORE_SUBJECTS, "مطالعات اجتماعی"],
  "چهارم ابتدایی": [...CORE_SUBJECTS, "مطالعات اجتماعی"],
  "پنجم ابتدایی": [...CORE_SUBJECTS, "مطالعات اجتماعی", "کار و فناوری"],
  "ششم ابتدایی": [...CORE_SUBJECTS, "مطالعات اجتماعی", "کار و فناوری"],
};
