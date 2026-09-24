"use client";

import { useEffect, useState } from "react";

type NewsItem = { id: number; title: string; body: string | null; link: string | null };
type CalendarItem = { id: number; title: string; day: string; kind: string };
type GalleryItem = { id: number; title: string | null; imageUrl: string };

export function ContentManagementPanel() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">مدیریت محتوای سایت</h2>
      <NewsManager />
      <CalendarManager />
      <GalleryManager />
      <ContactManager />
    </div>
  );
}

// ---------------------------------------------------------------------------
// NEWS
// ---------------------------------------------------------------------------
function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        body: form.get("body"),
        link: form.get("link"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ثبت خبر انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/news?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="rounded-xl border border-teal-100 p-4">
      <p className="text-sm font-medium">اخبار</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <input name="title" placeholder="عنوان خبر" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <textarea name="body" placeholder="متن خبر (اختیاری)" className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <input name="link" placeholder="لینک (اختیاری)" className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60">
          {pending ? "در حال ثبت…" : "افزودن خبر"}
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </form>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((n) => (
          <li key={n.id} className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-xs">
            <span>{n.title}</span>
            <button onClick={() => remove(n.id)} className="text-red-600 underline">
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CALENDAR
// ---------------------------------------------------------------------------
function CalendarManager() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/calendar-events")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
  }
  useEffect(refresh, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        day: form.get("day"),
        kind: form.get("kind"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ثبت رویداد انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/calendar-events?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="rounded-xl border border-teal-100 p-4">
      <p className="text-sm font-medium">تقویم</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <input name="title" placeholder="عنوان رویداد" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <input name="day" type="date" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <select name="kind" defaultValue="event" className="rounded-md border border-teal-200 px-3 py-2 text-sm">
          <option value="event">رویداد</option>
          <option value="holiday">تعطیل</option>
          <option value="exam">امتحان</option>
        </select>
        <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60">
          {pending ? "در حال ثبت…" : "افزودن رویداد"}
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </form>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-xs">
            <span>{c.title} — {c.day}</span>
            <button onClick={() => remove(c.id)} className="text-red-600 underline">
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GALLERY
// ---------------------------------------------------------------------------
function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
  }
  useEffect(refresh, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/gallery", {
      method: "POST",
      body: form, // multipart/form-data — do NOT set Content-Type manually
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "افزودن تصویر انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="rounded-xl border border-teal-100 p-4">
      <p className="text-sm font-medium">آلبوم تصاویر</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <input name="title" placeholder="عنوان (اختیاری)" className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60">
          {pending ? "در حال آپلود…" : "افزودن تصویر"}
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </form>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((g) => (
          <li key={g.id} className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs">
            <span>{g.title || g.imageUrl}</span>
            <button onClick={() => remove(g.id)} className="text-red-600 underline">
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTACT
// ---------------------------------------------------------------------------
function ContactManager() {
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setPhone(d.contactPhone ?? "");
        setFax(d.contactFax ?? "");
        setAddress(d.contactAddress ?? "");
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactPhone: phone, contactFax: fax, contactAddress: address }),
    });
    setPending(false);
    setSaved(true);
  }

  return (
    <div className="rounded-xl border border-teal-100 p-4">
      <p className="text-sm font-medium">اطلاعات تماس (صفحه «تماس با ما»)</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="تلفن" className="rounded-md border border-teal-200 px-3 py-2 text-sm" dir="ltr" />
        <input value={fax} onChange={(e) => setFax(e.target.value)} placeholder="فکس" className="rounded-md border border-teal-200 px-3 py-2 text-sm" dir="ltr" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس" className="rounded-md border border-teal-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60">
          {pending ? "در حال ذخیره…" : "ذخیره اطلاعات تماس"}
        </button>
        {saved ? <p className="text-xs text-green-600">ذخیره شد.</p> : null}
      </form>
    </div>
  );
}
