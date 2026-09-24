"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isNationalId, normalizeIdNumber } from "@/lib/digits";
import { BackLink } from "@/components/back-link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [accountType, setAccountType] = useState("student");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const idNumber = normalizeIdNumber(String(form.get("idNumber") ?? ""));
    if (!isNationalId(idNumber)) {
      setError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    setPending(true);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const inviteCode = String(form.get("inviteCode") ?? "").trim();
    const type = String(form.get("accountType") ?? "student");
    const studentCode = String(form.get("studentCode") ?? "").trim();
    const childIdNumber = normalizeIdNumber(String(form.get("childIdNumber") ?? ""));

    const signupRes = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber, firstName, lastName, password, accountType: type, studentCode, childIdNumber }),
    });

    if (!signupRes.ok) {
      const data = await signupRes.json().catch(() => ({}));
      setPending(false);
      setError(data.error ?? "ثبت‌نام انجام نشد.");
      return;
    }

    if (inviteCode) {
      const res = await fetch("/api/redeem-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPending(false);
        setError(data.error ?? "حساب ساخته شد، اما کد دعوت کار نکرد.");
        router.push("/dashboard");
        return;
      }
    }

    setPending(false);
    if (type === "student") router.push("/profile");
    else router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="school-hero-bg mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-12">
      <BackLink fallback="/login" />
      <div className="school-card rounded-3xl p-8">
        <p className="role-pill w-fit">سامانه مدرسه</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">ساخت حساب</h1>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            کد ملی
            <input
              name="idNumber"
              required
              inputMode="numeric"
              maxLength={10}
              minLength={10}
              pattern="[0-9۰-۹]{10}"
              placeholder="۱۰ رقم"
              className="field rounded-xl px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              نام
              <input name="firstName" required className="field rounded-xl px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              نام خانوادگی
              <input name="lastName" required className="field rounded-xl px-3 py-2" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            رمز عبور (حداقل ۸ نویسه)
            <input name="password" type="password" minLength={8} required className="field rounded-xl px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            نوع حساب
            <select
              name="accountType"
              className="field rounded-xl px-3 py-2"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="student">دانش‌آموز</option>
              <option value="parent">ولی</option>
            </select>
          </label>
          {accountType === "student" ? (
            <label className="flex flex-col gap-1 text-sm">
              کد دانش‌آموز
              <input name="studentCode" placeholder="اگر دفتر داده است" className="field rounded-xl px-3 py-2" />
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              کد ملی فرزند
              <input
                name="childIdNumber"
                inputMode="numeric"
                maxLength={10}
                className="field rounded-xl px-3 py-2"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            کد دعوت دفتر
            <input name="inviteCode" placeholder="فقط کارکنان" className="field rounded-xl px-3 py-2" />
          </label>
          {error ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-60">
            {pending ? "در حال ثبت…" : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          قبلاً حساب دارید؟{" "}
          <Link href="/login" className="font-bold underline">
            ورود
          </Link>
        </p>
      </div>
    </main>
  );
}
