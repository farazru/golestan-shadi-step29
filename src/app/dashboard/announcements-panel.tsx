"use client";

import { useEffect, useState } from "react";

type Course = { id: number; name: string };
type Message = {
  id: number;
  title: string | null;
  content: string;
  courseId: number | null;
  createdAt: string | null;
  senderFirstName: string;
  senderLastName: string;
  courseName: string | null;
  forChildren?: string[];
};

export function AnnouncementsPanel({
  canSend,
  canSendSchoolWide,
  courses,
}: {
  canSend: boolean;
  canSendSchoolWide: boolean;
  courses: Course[];
}) {
  const [items, setItems] = useState<Message[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setItems(data.messages ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title") ?? ""),
        content: String(fd.get("content") ?? ""),
        courseId: String(fd.get("courseId") ?? "all"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ارسال انجام نشد.");
      return;
    }
    form.reset();
    load();
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">اطلاعیه‌ها</h2>

      {canSend ? (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2 rounded-xl border border-teal-100 p-4 "
        >
          <input
            name="title"
            placeholder="عنوان (اختیاری)"
            className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
          />
          <textarea
            name="content"
            required
            rows={3}
            placeholder="متن اطلاعیه"
            className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
          />
          <select
            name="courseId"
            defaultValue={canSendSchoolWide ? "all" : courses[0]?.id ?? "all"}
            className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
          >
            {canSendSchoolWide ? <option value="all">کل مدرسه</option> : null}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending || (!canSendSchoolWide && courses.length === 0)}
            className="self-start rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 "
          >
            {pending ? "در حال ارسال…" : "ارسال اطلاعیه"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      ) : null}

      {items === null ? (
        <p className="text-sm text-teal-800/60">در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-teal-800/60">اطلاعیه‌ای نیست.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-teal-100 p-3 text-sm "
            >
              <p className="font-medium">{m.title || "اطلاعیه"}</p>
              <p className="mt-1 whitespace-pre-wrap text-teal-900 ">
                {m.content}
              </p>
              <p className="mt-2 text-xs text-teal-800/60">
                {m.senderFirstName} {m.senderLastName}
                {" · "}
                {m.courseName ?? "کل مدرسه"}
                {m.forChildren && m.forChildren.length > 0 ? ` · ${[...new Set(m.forChildren)].join("، ")}` : ""}
                {m.createdAt ? ` · ${m.createdAt.slice(0, 16).replace("T", " ")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
