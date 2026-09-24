"use client";

import { useEffect, useState } from "react";

type Link = {
  id: string;
  status: string;
  parentFirstName: string;
  parentLastName: string;
  parentUsername: string | null;
  studentFirstName: string;
  studentLastName: string;
  studentUsername: string | null;
};

const STATUS_FA: Record<string, string> = { pending: "در انتظار بررسی", approved: "تأیید شده", rejected: "رد شده" };

export function ParentLinksPanel() {
  const [links, setLinks] = useState<Link[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    fetch("/api/parents")
      .then((r) => r.json())
      .then((d) => setLinks(d.links ?? []));
  }
  useEffect(refresh, []);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    await fetch("/api/parents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    refresh();
  }

  const pending = (links ?? []).filter((l) => l.status === "pending");
  const decided = (links ?? []).filter((l) => l.status !== "pending");

  return (
    <section className="school-card rounded-2xl p-4">
      <h2 className="h-section mb-3 text-[var(--school-teal-dark)]">درخواست‌های ارتباط والدین</h2>
      {links === null ? (
        <p className="text-sm text-teal-800/60">در حال بارگذاری…</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-teal-800/60">درخواست در انتظار بررسی وجود ندارد.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pending.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm">
              <span>
                {l.parentFirstName} {l.parentLastName} (کد ملی: {l.parentUsername}) ← فرزند: {l.studentFirstName}{" "}
                {l.studentLastName} (کد ملی: {l.studentUsername})
              </span>
              <span className="flex gap-2">
                <button
                  disabled={busyId === l.id}
                  onClick={() => decide(l.id, "approved")}
                  className="rounded-full bg-teal-700 px-3 py-1 text-xs text-white disabled:opacity-60"
                >
                  تأیید
                </button>
                <button
                  disabled={busyId === l.id}
                  onClick={() => decide(l.id, "rejected")}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 disabled:opacity-60"
                >
                  رد
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {decided.length > 0 ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-teal-800/60">تصمیم‌های قبلی ({decided.length})</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {decided.map((l) => (
              <li key={l.id} className="text-xs text-teal-800/70">
                {l.parentFirstName} {l.parentLastName} ← {l.studentFirstName} {l.studentLastName} —{" "}
                {STATUS_FA[l.status] ?? l.status}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
