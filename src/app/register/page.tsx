import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";
import { RegisterForm } from "./form";

export const metadata = pageMeta({
  title: "ثبت‌نام آنلاین",
  description: "ثبت‌نام آنلاین گلستان شادی با کد پیگیری.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">ثبت‌نام آنلاین</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          فرم را پر کنید و مدارک را بارگذاری کنید. کد پیگیری دریافت می‌کنید و دفتر با شما تماس می‌گیرد.
        </p>
        <RegisterForm />
      </main>
      <SiteFooter />
    </div>
  );
}
