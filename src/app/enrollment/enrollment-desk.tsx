"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { emptyPayload, type RecordPayload } from "@/lib/enrollment";
import { GRADE_LEVELS } from "@/lib/grades";

const GRADES = ["آمادگی", ...GRADE_LEVELS];

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="field rounded-xl px-3 py-2"
      />
    </label>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="field rounded-xl px-3 py-2"
      >
        <option value="">انتخاب کنید</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EnrollmentDesk() {
  const params = useSearchParams();
  const studentId = params.get("studentId") || "";
  const [list, setList] = useState<{ id: string; name: string; grade: string | null; signed: boolean }[] | null>(null);
  const [payload, setPayload] = useState<RecordPayload>(emptyPayload());
  const [access, setAccess] = useState<"full" | "teacher" | null>(null);
  const [card, setCard] = useState<Record<string, string | null> | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RecordPayload>(key: K, value: RecordPayload[K]) {
    setPayload((p) => ({ ...p, [key]: value }));
  }

  useEffect(() => {
    const q = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
    fetch("/api/enrollment" + q)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "بارگذاری نشد.");
        if (data.access === "teacher") {
          setAccess("teacher");
          setCard(data.card);
          return;
        }
        setAccess("full");
        setPayload({ ...emptyPayload(), ...data.payload, payments: data.payload?.payments ?? emptyPayload().payments });
        setCanEdit(Boolean(data.canEdit));
        setSignedAt(data.signedAt);
        setSignerName(data.signerName || data.payload?.guardianName || "");
      })
      .catch((e: Error) => setError(e.message));

    if (!studentId) {
      fetch("/api/enrollment?list=1")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.students) setList(d.students);
        })
        .catch(() => undefined);
    }
  }, [studentId]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/enrollment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: studentId || undefined, payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "ذخیره نشد.");
      return;
    }
    setMsg("مشخصات ذخیره شد. پایین صفحه قرارداد را بخوانید و امضا کنید.");
  }

  async function sign() {
    setError(null);
    const res = await fetch("/api/enrollment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: studentId || undefined, signerName, accepted }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "امضا ثبت نشد.");
      return;
    }
    setSignedAt(data.signedAt);
    setMsg("قرارداد امضا شد. بعداً هم می‌توانید مشخصات را ویرایش کنید.");
  }

  const ro = !canEdit;

  return (
    <main className="school-hero-bg mx-auto w-full max-w-3xl px-4 py-8">
      <BackLink fallback="/dashboard" />
      <h1 className="h-display text-2xl">پرونده ثبت‌نام و قرارداد شهریه</h1>
      <p className="mt-2 text-sm text-muted">آموزشگاه آمادگی و دبستان گلستان شادی · سال تحصیلی ۱۴۰۵–۱۴۰۶</p>
      {error ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {msg ? <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{msg}</p> : null}

      {list ? (
        <section className="school-card mt-4 rounded-3xl p-4">
          <h2 className="font-extrabold">پرونده دانش‌آموزان</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {list.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span>
                  {s.name} {s.grade ? `· ${s.grade}` : ""}
                </span>
                <Link href={`/enrollment?studentId=${s.id}`} className="btn-primary rounded-full px-3 py-1 text-xs">
                  {s.signed ? "امضا شده" : "مشاهده"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {access === "teacher" && card ? (
        <section className="school-card mt-4 rounded-3xl p-5">
          <h2 className="font-extrabold">اطلاعات لازم کلاس</h2>
          <p className="mt-1 text-sm text-muted">معلم فقط شماره تماس و چند مورد ضروری را می‌بیند، نه کل پرونده.</p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div>نام: {card.fullName}</div>
            <div>پایه: {card.grade || "—"}</div>
            <div>تلفن ضروری: {card.emergencyPhone || "—"}</div>
            <div>تلفن پدر: {card.fatherPhone || "—"}</div>
            <div>تلفن مادر: {card.motherPhone || "—"}</div>
            <div>زندگی با: {card.livesWith || "—"}</div>
            <div>سرویس: {card.transport || "—"}</div>
          </dl>
        </section>
      ) : null}

      {access === "full" ? (
        <form onSubmit={save} className="mt-4 flex flex-col gap-4">
          <section className="school-card rounded-3xl p-5">
            <h2 className="font-extrabold">مشخصات دانش‌آموز</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Choice label="مقطع تحصیلی" value={payload.section} options={["پیش‌دبستان", "دبستان"]} onChange={(v) => set("section", v)} readOnly={ro} />
              <Choice label="پایه" value={payload.grade} options={GRADES} onChange={(v) => set("grade", v)} readOnly={ro} />
              <Field label="نام و نام خانوادگی" value={payload.fullName} onChange={(v) => set("fullName", v)} readOnly={ro} />
              <Field label="کد ملی" value={payload.nationalId} onChange={(v) => set("nationalId", v)} readOnly={ro} />
              <Field label="عدد و حرف سری شناسنامه" value={payload.idSerial} onChange={(v) => set("idSerial", v)} readOnly={ro} />
              <Field label="محل صدور شناسنامه" value={payload.idIssuePlace} onChange={(v) => set("idIssuePlace", v)} readOnly={ro} />
              <Field label="محل تولد" value={payload.birthPlace} onChange={(v) => set("birthPlace", v)} readOnly={ro} />
              <Field label="تاریخ تولد" value={payload.birthDate} onChange={(v) => set("birthDate", v)} readOnly={ro} />
              <Field label="ملیت" value={payload.nationality} onChange={(v) => set("nationality", v)} readOnly={ro} />
              <Field label="دین" value={payload.religion} onChange={(v) => set("religion", v)} readOnly={ro} />
              <Field label="مذهب" value={payload.sect} onChange={(v) => set("sect", v)} readOnly={ro} />
              <Choice label="با چه کسی زندگی می‌کند؟" value={payload.livesWith} options={["با پدر و مادر", "با پدر", "با مادر", "سایر"]} onChange={(v) => set("livesWith", v)} readOnly={ro} />
              <Choice label="بیمه تکمیلی" value={payload.insurance} options={["دارد", "ندارد"]} onChange={(v) => set("insurance", v)} readOnly={ro} />
              <Choice label="متقاضی سرویس" value={payload.transport} options={["هستم", "نیستم"]} onChange={(v) => set("transport", v)} readOnly={ro} />
              <Field label="فرزند چندم" value={payload.childOrder} onChange={(v) => set("childOrder", v)} readOnly={ro} />
              <Choice label="دست" value={payload.handedness} options={["راست‌دست", "چپ‌دست"]} onChange={(v) => set("handedness", v)} readOnly={ro} />
              <Choice label="نسبت فامیلی والدین" value={payload.parentsRelated} options={["خیر", "بله"]} onChange={(v) => set("parentsRelated", v)} readOnly={ro} />
              <Field label="آدرس منزل" value={payload.homeAddress} onChange={(v) => set("homeAddress", v)} readOnly={ro} />
              <Field label="کد پستی" value={payload.postalCode} onChange={(v) => set("postalCode", v)} readOnly={ro} />
              <Field label="شماره تلفن ضروری" value={payload.emergencyPhone} onChange={(v) => set("emergencyPhone", v)} readOnly={ro} />
            </div>
          </section>

          <section className="school-card rounded-3xl p-5">
            <h2 className="font-extrabold">مشخصات پدر</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="نام" value={payload.fatherFirst} onChange={(v) => set("fatherFirst", v)} readOnly={ro} />
              <Field label="نام خانوادگی" value={payload.fatherLast} onChange={(v) => set("fatherLast", v)} readOnly={ro} />
              <Field label="کد ملی" value={payload.fatherNationalId} onChange={(v) => set("fatherNationalId", v)} readOnly={ro} />
              <Field label="مدرک تحصیلی" value={payload.fatherEducation} onChange={(v) => set("fatherEducation", v)} readOnly={ro} />
              <Field label="رشته تحصیلی" value={payload.fatherField} onChange={(v) => set("fatherField", v)} readOnly={ro} />
              <Field label="سریال و حرف و عدد سری شناسنامه" value={payload.fatherIdSerial} onChange={(v) => set("fatherIdSerial", v)} readOnly={ro} />
              <Field label="تاریخ تولد" value={payload.fatherBirthDate} onChange={(v) => set("fatherBirthDate", v)} readOnly={ro} />
              <Field label="محل صدور شناسنامه" value={payload.fatherIdIssuePlace} onChange={(v) => set("fatherIdIssuePlace", v)} readOnly={ro} />
              <Field label="محل تولد" value={payload.fatherBirthPlace} onChange={(v) => set("fatherBirthPlace", v)} readOnly={ro} />
              <Field label="شغل" value={payload.fatherJob} onChange={(v) => set("fatherJob", v)} readOnly={ro} />
              <Field label="آدرس محل کار" value={payload.fatherWorkAddress} onChange={(v) => set("fatherWorkAddress", v)} readOnly={ro} />
              <Field label="شماره تلفن" value={payload.fatherPhone} onChange={(v) => set("fatherPhone", v)} readOnly={ro} />
              <Choice label="وضعیت تأهل" value={payload.fatherMarital} options={["متأهل", "مطلقه", "مجرد"]} onChange={(v) => set("fatherMarital", v)} readOnly={ro} />
            </div>
          </section>

          <section className="school-card rounded-3xl p-5">
            <h2 className="font-extrabold">مشخصات مادر</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="نام" value={payload.motherFirst} onChange={(v) => set("motherFirst", v)} readOnly={ro} />
              <Field label="نام خانوادگی" value={payload.motherLast} onChange={(v) => set("motherLast", v)} readOnly={ro} />
              <Field label="کد ملی" value={payload.motherNationalId} onChange={(v) => set("motherNationalId", v)} readOnly={ro} />
              <Field label="مدرک تحصیلی" value={payload.motherEducation} onChange={(v) => set("motherEducation", v)} readOnly={ro} />
              <Field label="رشته تحصیلی" value={payload.motherField} onChange={(v) => set("motherField", v)} readOnly={ro} />
              <Field label="سریال و حرف و عدد سری شناسنامه" value={payload.motherIdSerial} onChange={(v) => set("motherIdSerial", v)} readOnly={ro} />
              <Field label="تاریخ تولد" value={payload.motherBirthDate} onChange={(v) => set("motherBirthDate", v)} readOnly={ro} />
              <Field label="محل صدور شناسنامه" value={payload.motherIdIssuePlace} onChange={(v) => set("motherIdIssuePlace", v)} readOnly={ro} />
              <Field label="محل تولد" value={payload.motherBirthPlace} onChange={(v) => set("motherBirthPlace", v)} readOnly={ro} />
              <Field label="شغل" value={payload.motherJob} onChange={(v) => set("motherJob", v)} readOnly={ro} />
              <Field label="شماره تلفن" value={payload.motherPhone} onChange={(v) => set("motherPhone", v)} readOnly={ro} />
              <Choice label="وضعیت مسکن" value={payload.motherHousing} options={["شخصی", "اجاره‌ای"]} onChange={(v) => set("motherHousing", v)} readOnly={ro} />
              <Field label="آدرس محل کار" value={payload.motherWorkAddress} onChange={(v) => set("motherWorkAddress", v)} readOnly={ro} />
              <Choice label="وضعیت تأهل" value={payload.motherMarital} options={["متأهل", "مطلقه", "مجرد"]} onChange={(v) => set("motherMarital", v)} readOnly={ro} />
            </div>
          </section>

          {canEdit ? <button className="btn-primary rounded-full px-5 py-2 font-extrabold">ذخیره مشخصات</button> : null}
        </form>
      ) : null}

      {access === "full" ? (
        <section className="school-card mt-4 rounded-3xl p-5 text-sm leading-8">
          <h2 className="text-lg font-extrabold">فرم قرارداد اخذ شهریه بین ولی دانش‌آموز و واحد آموزشی</h2>
          <p className="font-bold">گلستان شادی · سال تحصیلی ۱۴۰۵–۱۴۰۶</p>
          <p className="mt-3">
            قرارداد زیر در تاریخ {payload.contractDate || "…………"} بین واحد آموزشی گلستان شادی با {payload.guardianTitle || "آقای / خانم"}{" "}
            {payload.guardianName || "…………"} ولی دانش‌آموز {payload.fullName || "…………"} پایه {payload.grade || "…………"} منعقد می‌گردد.
          </p>
          <p>
            شهریه ثابت مبلغ {payload.feeRial || "…………"} ریال می‌باشد. توجه: مبالغ مذکور علی‌الحساب بوده، چنانچه شهریه مصوب بیشتر یا کمتر شود در شهریه دانش‌آموزان منظور خواهد شد و مطابق دستورالعمل ابلاغی از سوی آموزش و پرورش خواهد بود.
          </p>
          <p>
            تذکر مهم: به استناد مصوبه ۳۳۷ مورخ ۱۴۰۲/۰۴/۱۰ شورای نظارت مرکزی، اطلاع از موارد ذیل جهت تسویه مالی و دریافت پرونده تحصیلی الزامی است. چنانچه دانش‌آموز پس از ثبت‌نام، قبل از شروع سال تحصیلی منصرف شود، معادل ۵٪ (پنج درصد) شهریه؛ قبل از امتحانات نوبت اول ۵۰ درصد؛ و پس از امتحانات نوبت اول ۱۰۰ درصد شهریه باید پرداخت نماید.
          </p>
          <p>
            ماده ۲. تعهدات پرداخت شهریه: ولی دانش‌آموز متعهد به پرداخت مبلغ {payload.committedRial || "…………"} ریال به صورت علی‌الحساب است. سایر مبالغ مالی در جدول زیر درج می‌شود.
          </p>
          <p>هزینه‌های لباس فرم، کیف، مراسم، عکس، جشن پایان تحصیلی و مانند آن نقد و جداگانه پرداخت می‌شود.</p>

          {canEdit ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="تاریخ قرارداد" value={payload.contractDate} onChange={(v) => set("contractDate", v)} />
              <Choice label="ولی" value={payload.guardianTitle} options={["آقای", "خانم"]} onChange={(v) => set("guardianTitle", v)} />
              <Field label="نام ولی" value={payload.guardianName} onChange={(v) => set("guardianName", v)} />
              <Field label="شهریه ثابت (ریال)" value={payload.feeRial} onChange={(v) => set("feeRial", v)} />
              <Field label="مبلغ تعهد علی‌الحساب (ریال)" value={payload.committedRial} onChange={(v) => set("committedRial", v)} />
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border text-xs">
              <thead>
                <tr>
                  {["نوع پرداخت", "تاریخ", "شماره فیش / چک", "بانک", "کد شعبه", "شعبه", "تاریخ واریز", "مبلغ به ریال"].map((h) => (
                    <th key={h} className="border p-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.payments.map((row, i) => (
                  <tr key={i}>
                    {(["type", "date", "receipt", "bank", "branchCode", "branch", "date2", "amount"] as const).map((k) => (
                      <td key={k} className="border p-1">
                        <input
                          value={row[k]}
                          readOnly={ro}
                          aria-label={`${k} ${i + 1}`}
                          onChange={(e) => {
                            const payments = payload.payments.map((p, idx) => (idx === i ? { ...p, [k]: e.target.value } : p));
                            set("payments", payments);
                          }}
                          className="w-full bg-transparent px-1 py-1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {signedAt ? (
            <p className="mt-4 font-bold">امضا شده توسط {signerName} در {new Date(signedAt).toLocaleString("fa-IR")}</p>
          ) : canEdit ? (
            <div className="mt-4 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                متن قرارداد را خواندم و می‌پذیرم.
              </label>
              <Field label="نام و نام خانوادگی ولی" value={signerName} onChange={setSignerName} />
              <button type="button" onClick={sign} className="btn-secondary w-fit rounded-full px-4 py-2 font-extrabold">
                امضای قرارداد
              </button>
            </div>
          ) : (
            <p className="mt-4">این قرارداد هنوز امضا نشده است.</p>
          )}
          <p className="mt-4 text-muted">امضای قسط اول، مسئول امور مالی، قسط دوم و تسویه، و مهر مدرسه در دفتر روی نسخه کاغذی انجام می‌شود.</p>
        </section>
      ) : null}
    </main>
  );
}
