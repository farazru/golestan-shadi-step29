"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADE_LEVELS } from "@/lib/grades";

type Student = { id: string; firstName: string; lastName: string; username: string | null; grade: string | null };
type Course = { id: number; name: string; grade?: string };

export function UnenrolledStudentsPanel({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[] | null>(null);
  const [openProfileFor, setOpenProfileFor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/students/unenrolled")
      .then((r) => r.json())
      .then((data) => setStudents(data.students ?? []));
  }, []);

  async function enroll(studentId: string, courseId: number) {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId }),
    });
    if (res.ok) {
      setStudents((prev) => (prev ? prev.filter((s) => s.id !== studentId) : prev));
      router.refresh();
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">دانش‌آموزانی که ثبت‌نام دوره را کامل نکرده‌اند</h2>
      {students === null ? (
        <p className="text-sm text-teal-800/60">در حال بارگذاری…</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-teal-800/60">همه دانش‌آموزان در دوره‌ای ثبت‌نام شده‌اند.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li key={s.id} className="rounded-lg border border-teal-100 p-3 text-sm ">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-teal-800/60">
                    کد ملی: {s.username}
                    {s.grade ? ` · پایه: ${s.grade}` : " · پایه تعیین نشده"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      const courseId = Number(e.target.value);
                      if (courseId) enroll(s.id, courseId);
                    }}
                    defaultValue=""
                    className="rounded-md border border-teal-200 bg-white px-2 py-1 text-xs  "
                  >
                    <option value="" disabled>
                      ثبت‌نام در دوره…
                    </option>
                    {courses
                      .filter((c) => !s.grade || !c.grade || c.grade === s.grade)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.grade ? ` (${c.grade})` : ""}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => setOpenProfileFor(openProfileFor === s.id ? null : s.id)}
                    className="rounded-full border border-teal-200 px-3 py-1 text-xs "
                  >
                    {openProfileFor === s.id ? "بستن" : "تکمیل اطلاعات"}
                  </button>
                </div>
              </div>
              {openProfileFor === s.id ? <StudentProfileForm studentId={s.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StudentProfileForm({ studentId }: { studentId: string }) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initial, setInitial] = useState<{
    grade: string;
    dateOfBirth: string;
    address: string;
    studentPhone: string;
    fatherName: string;
    fatherPhone: string;
    motherName: string;
    motherPhone: string;
    notes: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/student-profile?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((data) => {
        const prof = data.profile ?? {};
        setInitial({
          grade: data.grade ?? "",
          dateOfBirth: prof.dateOfBirth ?? "",
          address: prof.address ?? "",
          studentPhone: prof.studentPhone ?? "",
          fatherName: prof.fatherName ?? "",
          fatherPhone: prof.fatherPhone ?? "",
          motherName: prof.motherName ?? "",
          motherPhone: prof.motherPhone ?? "",
          notes: prof.notes ?? "",
        });
      })
      .catch(() =>
        setInitial({
          grade: "",
          dateOfBirth: "",
          address: "",
          studentPhone: "",
          fatherName: "",
          fatherPhone: "",
          motherName: "",
          motherPhone: "",
          notes: "",
        }),
      );
  }, [studentId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch("/api/student-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...body }),
    });
    setPending(false);
    if (res.ok) setSaved(true);
  }

  if (!initial) {
    return <p className="mt-3 text-xs text-teal-800/60">در حال بارگذاری پرونده…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-teal-50 p-3 ">
      <label className="col-span-2 flex flex-col gap-1 text-xs">
        پایه تحصیلی
        <select name="grade" defaultValue={initial.grade} className="rounded-md border border-teal-200 px-2 py-1  ">
          <option value="" disabled>
            پایه تحصیلی را انتخاب کنید
          </option>
          {GRADE_LEVELS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-xs">
        تاریخ تولد
        <input name="dateOfBirth" type="date" defaultValue={initial.dateOfBirth} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-xs">
        آدرس
        <input name="address" defaultValue={initial.address} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-xs">
        شماره تلفن دانش‌آموز
        <input name="studentPhone" defaultValue={initial.studentPhone} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        نام پدر
        <input name="fatherName" defaultValue={initial.fatherName} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        تلفن پدر
        <input name="fatherPhone" defaultValue={initial.fatherPhone} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        نام مادر
        <input name="motherName" defaultValue={initial.motherName} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        تلفن مادر
        <input name="motherPhone" defaultValue={initial.motherPhone} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-xs">
        توضیحات دیگر
        <textarea name="notes" defaultValue={initial.notes} className="rounded-md border border-teal-200 px-2 py-1  " />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="col-span-2 self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60 "
      >
        {pending ? "در حال ذخیره…" : "ذخیره اطلاعات"}
      </button>
      {saved ? <p className="col-span-2 text-xs text-green-600">ذخیره شد.</p> : null}
    </form>
  );
}
