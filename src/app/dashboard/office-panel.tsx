"use client";

import { useEffect, useState } from "react";
import { GRADE_LEVELS } from "@/lib/grades";

type Assignment = {
  id: number;
  title: string;
  courseName?: string;
  dueAt?: string | null;
  instructions?: string | null;
  submitted?: boolean;
};

type GradeRow = {
  id: number;
  courseName?: string;
  studentName?: string;
  kind?: string;
  score?: number;
  note?: string | null;
};
import { formatJalali } from "@/lib/jalali";

export function OfficePanel() {
  const [signupOpen, setSignupOpen] = useState(true);
  const [requireCode, setRequireCode] = useState(false);
  const [codes, setCodes] = useState<{ code: string; grade: string | null; used: boolean }[]>([]);
  const [resetId, setResetId] = useState("");
  const [tempPass, setTempPass] = useState<string | null>(null);

  function load() {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setSignupOpen(Boolean(d.signupOpen));
      setRequireCode(Boolean(d.requireStudentCode));
    });
    fetch("/api/student-codes").then((r) => r.json()).then((d) => setCodes(d.codes ?? []));
  }
  useEffect(() => { load(); }, []);

  async function saveSettings(next: { signupOpen?: boolean; requireStudentCode?: boolean }) {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    load();
  }

  async function makeCode(grade: string) {
    await fetch("/api/student-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade }),
    });
    load();
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber: resetId }),
    });
    const data = await res.json();
    if (res.ok) setTempPass(`${data.name}: ${data.temporaryPassword}`);
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">دفتر مدرسه</h2>
      <div className="school-card flex flex-col gap-3 rounded-2xl p-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={signupOpen} onChange={(e) => { setSignupOpen(e.target.checked); void saveSettings({ signupOpen: e.target.checked }); }} />
          ثبت‌نام آزاد باز باشد
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={requireCode} onChange={(e) => { setRequireCode(e.target.checked); void saveSettings({ requireStudentCode: e.target.checked }); }} />
          دانش‌آموز برای ثبت‌نام به کد دفتر نیاز دارد
        </label>
        <a href="/api/backup" className="btn-secondary w-fit rounded-full px-3 py-1 text-xs">دانلود نسخه پشتیبان پایگاه داده</a>
        <p className="text-xs text-teal-800/60">برای استقرار واقعی، DATABASE_URL تورسو را در .env بگذارید.</p>
      </div>

      <div className="school-card flex flex-col gap-2 rounded-2xl p-4 text-sm">
        <p className="font-medium">کد ثبت‌نام دانش‌آموز</p>
        <div className="flex flex-wrap gap-2">
          {GRADE_LEVELS.map((g) => (
            <button key={g} type="button" className="btn-secondary rounded-full px-3 py-1 text-xs" onClick={() => void makeCode(g)}>
              کد برای {g}
            </button>
          ))}
        </div>
        <ul className="mt-2 flex flex-col gap-1 text-xs">
          {codes.map((c) => (
            <li key={c.code} className="flex justify-between">
              <span className="font-mono">{c.code}</span>
              <span>{c.grade} · {c.used ? "استفاده شده" : "آزاد"}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={resetPassword} className="school-card flex flex-col gap-2 rounded-2xl p-4 text-sm">
        <p className="font-medium">بازنشانی رمز بدون ایمیل</p>
        <input value={resetId} onChange={(e) => setResetId(e.target.value)} placeholder="کد ملی کاربر" className="field rounded-xl px-3 py-2" />
        <button className="btn-primary w-fit rounded-full px-4 py-2 text-xs">ساخت رمز موقت</button>
        {tempPass ? <p className="text-xs">این رمز را چاپ کنید و به دفتر بدهید: <strong>{tempPass}</strong></p> : null}
      </form>
    </section>
  );
}

export function HomeworkPanel({
  canCreate,
  courses,
}: {
  canCreate: boolean;
  courses: { id: number; name: string }[];
}) {
  const [items, setItems] = useState<Assignment[] | null>(null);
  useEffect(() => {
    fetch("/api/assignments").then((r) => r.json()).then((d) => setItems(d.assignments ?? []));
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        instructions: fd.get("instructions"),
        dueAt: fd.get("dueAt"),
        courseId: fd.get("courseId"),
      }),
    });
    const data = await fetch("/api/assignments").then((r) => r.json());
    setItems(data.assignments ?? []);
    e.currentTarget.reset();
  }

  async function submitWork(assignmentId: number, form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.set("assignmentId", String(assignmentId));
    await fetch("/api/submissions", { method: "POST", body: fd });
    const data = await fetch("/api/assignments").then((r) => r.json());
    setItems(data.assignments ?? []);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">تکالیف</h2>
      {canCreate ? (
        <form onSubmit={create} className="school-card flex flex-col gap-2 rounded-2xl p-4">
          <input name="title" required placeholder="عنوان تکلیف" className="field rounded-xl px-3 py-2 text-sm" />
          <textarea name="instructions" placeholder="توضیح" className="field rounded-xl px-3 py-2 text-sm" />
          <input name="dueAt" type="date" className="field rounded-xl px-3 py-2 text-sm" />
          <select name="courseId" className="field rounded-xl px-3 py-2 text-sm">
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn-primary w-fit rounded-full px-4 py-2 text-sm">ثبت تکلیف</button>
        </form>
      ) : null}
      {items === null ? <p className="text-sm text-teal-800/60">در حال بارگذاری…</p> : items.length === 0 ? (
        <p className="text-sm text-teal-800/60">تکلیفی نیست.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => (
            <li key={a.id} className="rounded-xl border border-teal-100 bg-white/80 p-3 text-sm">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-teal-800/60">{a.courseName} {a.dueAt ? `· تا ${formatJalali(a.dueAt)}` : ""}</p>
              {a.instructions ? <p className="mt-1">{a.instructions}</p> : null}
              {a.submitted ? <p className="mt-1 text-xs text-teal-700">تحویل داده شد</p> : null}
              {!canCreate && !a.submitted ? (
                <form className="mt-2 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void submitWork(a.id, e.currentTarget); }}>
                  <input name="note" placeholder="یادداشت" className="field rounded-xl px-3 py-1 text-xs" />
                  <input name="file" type="file" className="text-xs" />
                  <button className="btn-primary w-fit rounded-full px-3 py-1 text-xs">تحویل تکلیف</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GradesPanel({
  canEdit,
  courses,
  students,
}: {
  canEdit: boolean;
  courses: { id: number; name: string }[];
  students: { id: string; firstName: string; lastName: string }[];
}) {
  const [rows, setRows] = useState<GradeRow[]>([]);
  useEffect(() => {
    fetch("/api/grades").then((r) => r.json()).then((d) => setRows(d.grades ?? []));
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: fd.get("courseId"),
        studentId: fd.get("studentId"),
        kind: fd.get("kind"),
        score: fd.get("score"),
        note: fd.get("note"),
      }),
    });
    const data = await fetch("/api/grades?studentId=" + fd.get("studentId")).then((r) => r.json());
    setRows(data.grades ?? []);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">دفتر نمره</h2>
      {canEdit ? (
        <form onSubmit={add} className="school-card grid grid-cols-2 gap-2 rounded-2xl p-4 text-sm">
          <select name="courseId" className="field rounded-xl px-2 py-2">{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select name="studentId" className="field rounded-xl px-2 py-2">{students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}</select>
          <select name="kind" className="field rounded-xl px-2 py-2">
            <option value="continuous">مستمر</option>
            <option value="midterm">میان‌ترم</option>
            <option value="final">پایانی</option>
          </select>
          <input name="score" required placeholder="نمره" className="field rounded-xl px-2 py-2" />
          <input name="note" placeholder="توضیح" className="col-span-2 field rounded-xl px-2 py-2" />
          <button className="btn-primary col-span-2 w-fit rounded-full px-4 py-2">ثبت نمره</button>
        </form>
      ) : null}
      <ul className="flex flex-col gap-1 text-sm">
        {rows.map((g) => (
          <li key={g.id} className="flex justify-between rounded-xl border border-teal-100 bg-white/80 px-3 py-2">
            <span>{g.courseName} · {g.kind === "final" ? "پایانی" : g.kind === "midterm" ? "میان‌ترم" : "مستمر"}</span>
            <span>{g.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AvatarPicker() {
  const [opts, setOpts] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/avatar").then((r) => r.json()).then((d) => setOpts(d.options ?? []));
  }, []);
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((a) => (
        <button key={a} type="button" className="text-2xl" onClick={() => void fetch("/api/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar: a }) })}>
          {a}
        </button>
      ))}
    </div>
  );
}

export function WhatsAppAbsent({ name, phone }: { name: string; phone?: string | null }) {
  if (!phone) return null;
  const text = encodeURIComponent(`سلام، ${name} امروز در مدرسه غایب ثبت شد.`);
  const num = phone.replace(/[^\d]/g, "");
  return (
    <a className="text-xs underline" href={`https://wa.me/${num}?text=${text}`} target="_blank" rel="noreferrer">
      پیام واتساپ به ولی
    </a>
  );
}
