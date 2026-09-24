"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADE_LEVELS, GRADE_SUBJECTS, type GradeLevel } from "@/lib/grades";

type Teacher = { id: string; firstName: string; lastName: string };

export function CreateCourseForm({ role }: { role: "teacher" | "manager" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [grade, setGrade] = useState<GradeLevel | "">("");

  useEffect(() => {
    if (role === "manager") {
      fetch("/api/teachers")
        .then((r) => r.json())
        .then((data) => setTeachers(data.teachers ?? []));
    }
  }, [role]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const description = String(form.get("description") ?? "");
    const teacherId = String(form.get("teacherId") ?? "");

    if (!grade) {
      setPending(false);
      setError("لطفاً پایه تحصیلی را انتخاب کنید.");
      return;
    }
    if (role === "manager" && !teacherId) {
      setPending(false);
      setError("لطفاً یک معلم انتخاب کنید.");
      return;
    }

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, grade, teacherId: teacherId || undefined }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ساخت دوره انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    setGrade("");
    router.refresh();
  }

  const subjectSuggestions = grade ? GRADE_SUBJECTS[grade] : [];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-teal-100 p-4 ">
      <p className="text-sm font-medium">ساخت دوره جدید</p>

      <select
        name="grade"
        required
        value={grade}
        onChange={(e) => setGrade(e.target.value as GradeLevel)}
        className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
      >
        <option value="" disabled>
          پایه تحصیلی را انتخاب کنید
        </option>
        {GRADE_LEVELS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <input
        name="name"
        placeholder={grade ? "عنوان درس (یا از فهرست پیشنهادی انتخاب کنید)" : "ابتدا پایه را انتخاب کنید"}
        required
        list="subject-suggestions"
        className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
      />
      <datalist id="subject-suggestions">
        {subjectSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {grade ? (
        <div className="flex flex-wrap gap-1.5">
          {subjectSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => {
                const form = e.currentTarget.closest("form");
                const input = form?.querySelector<HTMLInputElement>('input[name="name"]');
                if (input) input.value = s;
              }}
              className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs text-teal-800 hover:bg-teal-100"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {role === "manager" ? (
        <select
          name="teacherId"
          required
          defaultValue=""
          className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
        >
          <option value="" disabled>
            {teachers === null ? "در حال بارگذاری معلم‌ها…" : "معلم این دوره را انتخاب کنید"}
          </option>
          {(teachers ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
      ) : null}
      <input
        name="description"
        placeholder="توضیح کوتاه (اختیاری)"
        className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
      />
      <button
        type="submit"
        disabled={pending || (role === "manager" && teachers?.length === 0)}
        className="self-start rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 "
      >
        {pending ? "در حال ساخت…" : "ساخت دوره"}
      </button>
      {role === "manager" && teachers?.length === 0 ? (
        <p className="text-sm text-amber-700">
          هنوز هیچ معلمی ثبت‌نام نکرده — ابتدا یک کد دعوت معلم بسازید.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
