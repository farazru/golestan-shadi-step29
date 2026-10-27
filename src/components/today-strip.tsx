"use client";

import { useEffect, useState } from "react";

type Today = {
  nextClass?: string;
  announcement?: string;
  attendanceTaken?: boolean;
};

export function TodayStrip() {
  const [data, setData] = useState<Today | null>(null);

  useEffect(() => {
    fetch("/api/today")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D9E7E5] bg-white px-4 py-3 text-sm">
      {data.nextClass ? <span>کلاس بعدی: {data.nextClass}</span> : null}
      {data.announcement ? <span className="text-slate-600">اطلاعیه: {data.announcement}</span> : null}
      {data.attendanceTaken ? <span className="text-emerald-700">حضور امروز ثبت شده</span> : null}
    </div>
  );
}
