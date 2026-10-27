"use client";

import { useEffect, useState } from "react";

export function ManagerStats() {
  const [s, setS] = useState<{ attendanceRecords: number; activeClasses: number; unpaidToman: number } | null>(null);

  useEffect(() => {
    fetch("/api/manager-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setS)
      .catch(() => {});
  }, []);

  if (!s) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="school-card rounded-2xl p-4">
        <p className="text-xs text-slate-500">حضور ثبت‌شده</p>
        <p className="text-2xl font-bold">{s.attendanceRecords}</p>
      </div>
      <div className="school-card rounded-2xl p-4">
        <p className="text-xs text-slate-500">کلاس‌های فعال</p>
        <p className="text-2xl font-bold">{s.activeClasses}</p>
      </div>
      <div className="school-card rounded-2xl p-4">
        <p className="text-xs text-slate-500">شهریه پرداخت‌نشده</p>
        <p className="text-2xl font-bold">{new Intl.NumberFormat("fa-IR").format(s.unpaidToman)} تومان</p>
      </div>
    </div>
  );
}
