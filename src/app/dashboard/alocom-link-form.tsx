"use client";

import { useState } from "react";

export function AlocomLinkForm({ courseId, initial }: { courseId: number; initial: string | null }) {
  const [url, setUrl] = useState(initial ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, meetingUrl: url }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "لینک الوکام ذخیره شد." : data.error ?? "خطا");
  }
  return (
    <form onSubmit={save} className="mt-2 flex flex-col gap-2 text-sm">
      <input
        dir="ltr"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://alocom.co/..."
        className="field rounded-xl px-3 py-2 text-left"
      />
      <button className="btn-secondary w-fit rounded-full px-3 py-1">ذخیره لینک کلاس</button>
      {msg ? <p>{msg}</p> : null}
    </form>
  );
}
