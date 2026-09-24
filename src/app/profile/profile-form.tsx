"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackLink } from "@/components/back-link";

export function ProfileForm() {
  const params = useSearchParams();
  const studentId = params.get("studentId") || "";
  const [form, setForm] = useState({
    dateOfBirth: "",
    address: "",
    studentPhone: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    notes: "",
  });
  const [missing, setMissing] = useState<string[]>([]);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("/api/avatar/file");

  useEffect(() => {
    const q = studentId ? `?studentId=${studentId}` : "";
    fetch("/api/student-profile" + q)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setForm({
            dateOfBirth: d.profile.dateOfBirth ?? "",
            address: d.profile.address ?? "",
            studentPhone: d.profile.studentPhone ?? "",
            fatherName: d.profile.fatherName ?? "",
            fatherPhone: d.profile.fatherPhone ?? "",
            motherName: d.profile.motherName ?? "",
            motherPhone: d.profile.motherPhone ?? "",
            notes: d.profile.notes ?? "",
          });
        }
        setMissing(d.missing ?? []);
      })
      .catch(() => setMissing([]));
  }, [studentId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/student-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId: studentId || undefined }),
    });
    const data = await res.json();
    setMissing(data.missing ?? []);
    setMsg(data.complete ? "پرونده کامل شد. هر وقت خواستید برگردید و کامل‌تر کنید." : "ذخیره شد؛ هنوز چند مورد خالی است.");
  }

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <main className="school-hero-bg mx-auto max-w-lg px-4 py-10">
      <BackLink fallback="/dashboard" />
      <div className="school-card rounded-3xl p-6">
        <h1 className="text-2xl font-semibold">پرونده و عکس دانش‌آموز</h1>
        <p className="empty mt-1">همین صفحه را بعداً هم می‌توانید باز کنید و کامل کنید.</p>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/avatar/file", { method: "POST", body: fd });
            const data = await res.json().catch(() => ({}));
            setPhotoMsg(res.ok ? "عکس ذخیره شد." : data.error ?? "عکس ذخیره نشد.");
            if (res.ok) setPhotoUrl(`/api/avatar/file?t=${Date.now()}`);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            className="h-24 w-24 rounded-full bg-mint object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <label className="text-sm">
            عکس پرسنلی
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block" />
          </label>
          <button className="btn-secondary w-fit rounded-full px-4 py-2 text-sm">بارگذاری عکس</button>
          {photoMsg ? <p className="text-sm">{photoMsg}</p> : null}
        </form>
        {missing.length ? (
          <p className="mt-2 rounded-xl bg-sun px-3 py-2 text-sm">موارد ناقص: {missing.join("، ")}</p>
        ) : null}
        <form onSubmit={save} className="mt-4 flex flex-col gap-3">
          <label className="text-sm">
            تاریخ تولد
            <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            آدرس
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            تلفن دانش‌آموز
            <input value={form.studentPhone} onChange={(e) => set("studentPhone", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            نام پدر
            <input value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            تلفن پدر
            <input value={form.fatherPhone} onChange={(e) => set("fatherPhone", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            نام مادر
            <input value={form.motherName} onChange={(e) => set("motherName", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <label className="text-sm">
            تلفن مادر
            <input value={form.motherPhone} onChange={(e) => set("motherPhone", e.target.value)} className="field mt-1 w-full rounded-xl px-3 py-2" />
          </label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="یادداشت پزشکی یا توضیح" className="field rounded-xl px-3 py-2 text-sm" />
          <button className="btn-primary rounded-full px-4 py-2">ذخیره پرونده</button>
          {msg ? <p className="text-sm">{msg}</p> : null}
          <a href="/dashboard" className="text-sm underline">
            رفتن به داشبورد
          </a>
        </form>
      </div>
    </main>
  );
}
