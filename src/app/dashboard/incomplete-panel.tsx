"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function IncompletePanel() {
  const [rows, setRows] = useState<{ id: string; firstName: string; lastName: string; grade: string | null; missing: string[] }[]>([]);
  useEffect(() => {
    fetch("/api/incomplete-profiles")
      .then((r) => r.json())
      .then((d) => setRows(d.students ?? []));
  }, []);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">لیست اطلاعات ناقص دانش‌آموزها</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-teal-800/60">پرونده ناقصی نیست.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
              <span>
                {r.firstName} {r.lastName} {r.grade ? `(${r.grade})` : ""}
                <span className="mt-1 block text-xs text-amber-800">{r.missing.join("، ")}</span>
              </span>
              <Link href={`/profile?studentId=${r.id}`} className="btn-primary rounded-full px-3 py-1 text-xs">
                تکمیل
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ProfileBanner() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/student-profile")
      .then((r) => r.json())
      .then((d) => setN((d.missing ?? []).length));
  }, []);
  if (!n) return null;
  return (
    <Link href="/profile" className="block rounded-2xl bg-amber-100 p-4 text-sm text-amber-950">
      پرونده شما ناقص است ({n} مورد). برای ادامه، اطلاعات را کامل کنید.
    </Link>
  );
}
