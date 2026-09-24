import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/get-session";
import { TuitionClient } from "./tuition-client";
import { BackLink } from "@/components/back-link";

export default async function TuitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <BackLink fallback="/dashboard" />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">دفتر شهریه ۱۴۰۵–۱۴۰۶</h1>
        <p className="mt-2 text-sm text-slate-600">مبالغ به تومان است. مهر تا خرداد + پیش‌پرداخت.</p>
        <div className="mt-6">
          <TuitionClient />
        </div>
      </main>
    </div>
  );
}
