"use client";

import { useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  teacher: "معلم",
  manager: "مدیر",
  deputy: "معاون",
};

export function CreateInviteForm() {
  const [role, setRole] = useState<"teacher" | "manager" | "deputy">("teacher");
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setCode(null);
    const res = await fetch("/api/staff-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "ساخت کد دعوت انجام نشد.");
      return;
    }
    setCode(data.code);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-teal-100 p-4 ">
      <p className="text-sm font-medium">ساخت کد دعوت کارکنان</p>
      <div className="flex gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "teacher" | "manager" | "deputy")}
          className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm  "
        >
          <option value="teacher">معلم</option>
          <option value="deputy">معاون</option>
          <option value="manager">مدیر</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 "
        >
          {pending ? "در حال ساخت…" : "ساخت کد"}
        </button>
      </div>
      {code ? (
        <p className="text-sm">
          این کد را به {ROLE_LABELS[role]} جدید بدهید:{" "}
          <span className="font-mono font-semibold">{code}</span>
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
