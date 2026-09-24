"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { normalizeIdNumber } from "@/lib/digits";
import { BackLink } from "@/components/back-link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const idNumber = normalizeIdNumber(String(form.get("idNumber") ?? ""));
    if (!/^\d{10}$/.test(idNumber)) {
      setError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }
    const password = String(form.get("password") ?? "");
    setPending(true);

    const { error: signInError } = await authClient.signIn.username({
      username: idNumber,
      password,
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message ?? "کد ملی یا رمز عبور اشتباه است.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="school-hero-bg mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <BackLink />
      <div className="school-card rounded-3xl p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="" className="mx-auto h-16 w-auto object-contain" />
        <p className="role-pill mx-auto mt-3 w-fit">سامانه مدرسه</p>
        <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight">ورود</h1>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            کد ملی
            <input
              name="idNumber"
              required
              inputMode="numeric"
              maxLength={10}
              minLength={10}
              placeholder="۱۰ رقم"
              className="field rounded-xl px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            رمز عبور
            <input name="password" type="password" required className="field rounded-xl px-3 py-2" />
          </label>

          {error ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={pending} className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-60">
            {pending ? "در حال ورود…" : "ورود"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          حساب ندارید؟{" "}
          <Link href="/signup" className="font-bold underline">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </main>
  );
}
