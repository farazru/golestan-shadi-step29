"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/back-link";

type Info = {
  courseName: string;
  meetingUrl: string | null;
  status: string;
  canEdit: boolean;
  error?: string;
};

export function ClassroomClient({ roomId }: { roomId: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    fetch(`/api/classroom-room?roomId=${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((d) => {
        setInfo(d);
        if (d.meetingUrl) setUrl(d.meetingUrl);
      });
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classroom-room?roomId=${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setInfo(d);
        if (d.meetingUrl) setUrl(d.meetingUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/classroom-room", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, meetingUrl: url }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "لینک ذخیره شد." : data.error ?? "ذخیره نشد.");
    if (res.ok) load();
  }

  if (!info) return <main className="mx-auto max-w-lg px-4 py-12">در حال بارگذاری کلاس…</main>;
  if (info.error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <BackLink fallback="/dashboard" />
        <p>{info.error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-4 px-4 py-10">
      <BackLink fallback="/dashboard" />
      <p className="role-pill w-fit">کلاس الوکام</p>
      <h1 className="text-2xl font-bold">{info.courseName}</h1>
      {info.meetingUrl ? (
        <>
          <p className="empty">با زدن دکمه زیر به اتاق الوکام می‌روید. صدا و تصویر آنجا کنترل می‌شود.</p>
          <a
            href={info.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-center font-bold"
          >
            ورود به کلاس الوکام
          </a>
        </>
      ) : (
        <p className="empty">کلاس هنوز شروع نشده. معلم باید لینک الوکام را بگذارد.</p>
      )}
      {info.canEdit ? (
        <form onSubmit={save} className="school-card mt-4 flex flex-col gap-2">
          <p className="font-bold">لینک اتاق الوکام</p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://alocom.co/..."
            dir="ltr"
            className="field rounded-xl px-3 py-2 text-left text-sm"
          />
          <button className="btn-primary rounded-full px-4 py-2 text-sm">ذخیره لینک</button>
          {msg ? <p className="text-sm">{msg}</p> : null}
        </form>
      ) : null}
      <Link href="/dashboard" className="text-sm underline">
        بازگشت به داشبورد
      </Link>
    </main>
  );
}
