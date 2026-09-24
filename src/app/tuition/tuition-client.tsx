"use client";

import { useEffect, useMemo, useState } from "react";
import { TUITION_CLASSES, TUITION_MONTHS, formatToman } from "@/lib/school";

type Account = {
  id: number;
  studentId: string | null;
  fullName: string;
  classGroup: string;
  feeToman: number;
  note: string | null;
};
type Payment = {
  id: number;
  accountId: number;
  monthKey: string;
  amountToman: number;
  receipt: string | null;
};

export function TuitionClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [klass, setKlass] = useState<(typeof TUITION_CLASSES)[number]>("کلاس اول");

  function refresh() {
    fetch("/api/tuition")
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts ?? []);
        setPayments(d.payments ?? []);
        setCanEdit(Boolean(d.canEdit));
      })
      .catch(() => {});
  }

  useEffect(() => {
    refresh();
  }, []);

  const rows = accounts.filter((a) => a.classGroup === klass);

  async function addAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await fetch("/api/tuition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "account",
        fullName: f.get("fullName"),
        classGroup: klass,
        feeToman: Number(String(f.get("feeToman")).replace(/,/g, "")),
      }),
    });
    e.currentTarget.reset();
    refresh();
  }

  async function addPay(accountId: number, monthKey: string, amount: number, receipt: string) {
    await fetch("/api/tuition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "payment", accountId, monthKey, amountToman: amount, receipt }),
    });
    refresh();
  }

  const summary = useMemo(() => {
    const fee = rows.reduce((s, a) => s + a.feeToman, 0);
    const paid = payments
      .filter((p) => rows.some((a) => a.id === p.accountId))
      .reduce((s, p) => s + p.amountToman, 0);
    return { fee, paid, due: fee - paid };
  }, [rows, payments]);

  return (
    <div className="flex flex-col gap-5">
      <p className="empty">مبالغ به تومان است. شهریه سال معمولاً بیش از ۲۵٬۰۰۰٬۰۰۰ تومان است — هر ماه چند میلیون.</p>
      <div className="flex flex-wrap gap-2">
        {TUITION_CLASSES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setKlass(c)}
            className={`rounded-full px-3 py-1 text-xs ${klass === c ? "btn-primary" : "btn-secondary"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="school-card rounded-2xl p-3">شهریه کلاس<br />{formatToman(summary.fee)}</div>
        <div className="school-card rounded-2xl p-3">دریافت<br />{formatToman(summary.paid)}</div>
        <div className="school-card rounded-2xl p-3">مانده<br />{formatToman(summary.due)}</div>
      </div>

      {canEdit ? (
        <form onSubmit={addAccount} className="school-card flex flex-wrap gap-2 rounded-3xl p-4">
          <input name="fullName" required placeholder="نام دانش‌آموز" className="field rounded-xl px-3 py-2 text-sm" />
          <input name="feeToman" required placeholder="شهریه به تومان" className="field rounded-xl px-3 py-2 text-sm" />
          <button className="btn-primary rounded-full px-4 py-2 text-sm">افزودن ردیف</button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">نمایش فقط — ویرایش با دفتر مدرسه است.</p>
      )}

      <div className="overflow-x-auto school-card rounded-3xl">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b bg-[#e8f6f1] text-xs">
              <th className="p-2">نام</th>
              <th className="p-2">شهریه</th>
              {TUITION_MONTHS.map((m) => (
                <th key={m.key} className="p-2">
                  {m.label}
                </th>
              ))}
              <th className="p-2">جمع</th>
              <th className="p-2">مانده</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-6 text-center text-slate-500">
                  هنوز ردیفی نیست.
                </td>
              </tr>
            ) : (
              rows.map((a) => {
                const pays = payments.filter((p) => p.accountId === a.id);
                const total = pays.reduce((s, p) => s + p.amountToman, 0);
                return (
                  <tr key={a.id} className="border-b border-teal-50 align-top">
                    <td className="p-2 font-medium">{a.fullName}</td>
                    <td className="p-2 whitespace-nowrap">{formatToman(a.feeToman)}</td>
                    {TUITION_MONTHS.map((m) => {
                      const cell = pays.filter((p) => p.monthKey === m.key);
                      const sum = cell.reduce((s, p) => s + p.amountToman, 0);
                      return (
                        <td key={m.key} className="p-2">
                          {sum ? formatToman(sum) : "—"}
                          {cell[0]?.receipt ? <div className="text-[10px] text-slate-500">{cell[0].receipt}</div> : null}
                          {canEdit ? (
                            <PayMini
                              onSave={(amt, rec) => void addPay(a.id, m.key, amt, rec)}
                            />
                          ) : null}
                        </td>
                      );
                    })}
                    <td className="p-2">{formatToman(total)}</td>
                    <td className="p-2">{formatToman(a.feeToman - total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PayMini({ onSave }: { onSave: (amount: number, receipt: string) => void }) {
  return (
    <form
      className="mt-1 flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave(Number(f.get("amt")), String(f.get("rec") ?? ""));
        e.currentTarget.reset();
      }}
    >
      <input name="amt" placeholder="مبلغ" className="field w-24 rounded px-1 py-0.5 text-[11px]" />
      <input name="rec" placeholder="رسید" className="field w-24 rounded px-1 py-0.5 text-[11px]" />
      <button className="text-[10px] text-teal-700">ثبت</button>
    </form>
  );
}
